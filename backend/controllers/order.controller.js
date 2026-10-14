const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model.js");
const Order = require("../models/order.model.js");
const Product = require("../models/product.model.js");
const { getRazorpay } = require("../config/razorpay.js");

const requiredAddressFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];

const normalizeAddress = (address) => {
    if (!address || typeof address !== "object") return null;
    const normalized = {};
    for (const field of requiredAddressFields) {
        if (typeof address[field] !== "string" || !address[field].trim()) return null;
        normalized[field] = address[field].trim();
    }

    if (!/^[+\d\s().-]{7,20}$/.test(normalized.phone)) {
        return { error: "Enter a valid phone number." };
    }
    normalized.phone = normalized.phone.replace(/[\s().-]/g, "");
    if (!/^\+?\d{7,15}$/.test(normalized.phone)) {
        return { error: "Enter a valid phone number." };
    }
    if (!/^\d{6}$/.test(normalized.pincode)) {
        return { error: "Pincode must contain 6 digits." };
    }
    return normalized;
};

const clearCartIfItStillMatchesOrder = async (userId, order) => {
    const customer = await Customer.findById(userId).select("cart");
    if (!customer || customer.cart.length !== order.items.length) return;
    const expected = new Map(order.items.map((item) => [item.product.toString(), item.quantity]));
    const matches = customer.cart.every((item) =>
        expected.get(item.product.toString()) === item.quantity
    );
    if (matches) {
        await Customer.updateOne({ _id: userId }, { $set: { cart: [] } });
    }
};

const createPaymentOrder = async (req, res) => {
    let shopKartOrder;
    try {
        const shippingAddress = normalizeAddress(req.body.shippingAddress);
        if (!shippingAddress || shippingAddress.error) {
            return res.status(400).json({
                success: false,
                message: shippingAddress?.error || "All shipping address fields are required."
            });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer || !customer.cart.length) {
            return res.status(400).json({ success: false, message: "Your cart is empty." });
        }

        const productIds = customer.cart.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productsById = new Map(products.map((product) => [product._id.toString(), product]));
        const items = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const product = productsById.get(cartItem.product.toString());
            if (!product) {
                return res.status(400).json({ success: false, message: "A product in your cart is no longer available. Please update your cart." });
            }
            if (cartItem.quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
            }
            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });
            totalAmount += product.price * cartItem.quantity;
        }

        totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;
        if (!Number.isSafeInteger(Math.round(totalAmount * 100))) {
            return res.status(400).json({ success: false, message: "Order total is too large." });
        }

        shopKartOrder = await Order.create({
            user: customer._id,
            items,
            shippingAddress,
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        const razorpayOrder = await getRazorpay().orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: shopKartOrder._id.toString()
        });

        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        return res.status(201).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        if (shopKartOrder?._id) {
            await Order.deleteOne({ _id: shopKartOrder._id, user: req.user._id }).catch(() => {});
        }
        console.error("Create payment order error:", error);
        return res.status(500).json({ success: false, message: "Unable to start payment. Your cart has not been changed." });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId) ||
            typeof razorpay_order_id !== "string" || !razorpay_order_id ||
            typeof razorpay_payment_id !== "string" || !razorpay_payment_id ||
            typeof razorpay_signature !== "string" || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment details are incomplete or invalid." });
        }

        const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        if (order.paymentStatus === "PAID") {
            if (order.razorpayOrderId === razorpay_order_id && order.razorpayPaymentId === razorpay_payment_id) {
                await clearCartIfItStillMatchesOrder(req.user._id, order);
                return res.status(200).json({ success: true, order });
            }
            return res.status(409).json({ success: false, message: "This order has already been paid." });
        }
        if (order.inventoryDeducted) {
            return res.status(409).json({ success: false, message: "This order's stock update is still processing. Please refresh your orders." });
        }
        if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: "Payment order does not match." });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
            .digest("hex");
        const supplied = Buffer.from(razorpay_signature, "hex");
        const expected = Buffer.from(expectedSignature, "hex");
        if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
            return res.status(400).json({ success: false, message: "Invalid payment signature." });
        }

        const stockClaim = await Order.updateOne(
            { _id: order._id, user: req.user._id, paymentStatus: "PENDING", inventoryDeducted: false },
            { $set: { inventoryDeducted: true } }
        );
        if (stockClaim.modifiedCount !== 1) {
            return res.status(409).json({ success: false, message: "This payment is already being processed. Please refresh your orders." });
        }

        const decrementedProducts = [];
        const restoreStock = async () => {
            if (decrementedProducts.length) {
                await Product.bulkWrite(decrementedProducts.map(({ productId, quantity }) => ({
                    updateOne: {
                        filter: { _id: productId },
                        update: { $inc: { stock: quantity } }
                    }
                })));
            }
            await Order.updateOne(
                { _id: order._id, paymentStatus: "PENDING" },
                { $set: { inventoryDeducted: false } }
            );
        };

        try {
            for (const item of order.items) {
                const stockUpdate = await Product.updateOne(
                    { _id: item.product, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } }
                );

                if (stockUpdate.modifiedCount !== 1) {
                    await restoreStock();
                    return res.status(409).json({
                        success: false,
                        message: `Payment was received, but stock for ${item.name} is no longer available. Please contact support.`
                    });
                }
                decrementedProducts.push({ productId: item.product, quantity: item.quantity });
            }

            const paidUpdate = await Order.updateOne(
                { _id: order._id, paymentStatus: "PENDING", inventoryDeducted: true },
                { $set: { paymentStatus: "PAID", status: "PLACED", razorpayPaymentId: razorpay_payment_id } }
            );
            if (paidUpdate.modifiedCount !== 1) {
                throw new Error("Unable to finalize the verified order.");
            }
        } catch (finalizeError) {
            await restoreStock().catch((rollbackError) => {
                console.error("Stock rollback error:", rollbackError);
            });
            throw finalizeError;
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;

        await clearCartIfItStillMatchesOrder(req.user._id, order);
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Verify payment error:", error);
        return res.status(500).json({ success: false, message: "Unable to verify payment. Please contact support before retrying." });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Get orders error:", error);
        return res.status(500).json({ success: false, message: "Unable to load orders." });
    }
};

const getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Get order error:", error);
        return res.status(500).json({ success: false, message: "Unable to load this order." });
    }
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrderById };
