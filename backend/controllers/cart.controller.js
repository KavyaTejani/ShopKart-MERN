const mongoose = require("mongoose");

const Customer = require("../models/customer.model.js");
const Product = require("../models/product.model.js");

const addToCart = async (req, res) => {
    try{

        const {productId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId);

        if(!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
    
        const existingItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if(existingItem) {
            const newQuantity = existingItem.quantity + 1;

            if(newQuantity > product.stock){
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity exceeds available stock"
                });
            }

            existingItem.quantity = newQuantity;
        } else {
            if (product.stock < 1){
                return res.status(400).json({
                    success: false,
                    message: "Product is out of stock"
                });
            }

            customer.cart.push({
                product: product._id,
                quantity: 1
            });
        }

        await customer.save();

        await customer.populate({
            path: "cart.product",
            select: "name price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: customer.cart
        });
    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getCart = async (req,res) => {
    try{

        const customer = await Customer.findById(req.user._id)
            .populate({
                path: "cart.product",
                select: "name price category image stock"
            });

        if(!customer){
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            })
        }

        return res.status(200).json({
            success: true,
            cart: customer.cart
        });
    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

const updateCartQuantity = async (req, res) => {
    try{

        const {productId} = req.params;
        const {quantity} = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            })
        }

        if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity<1){
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            })
        }

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const product = await Product.findById(productId);

        if (!product){
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            })
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }
        cartItem.quantity = quantity;

        await customer.save();

        await customer.populate({
            path: "cart.product",
            select: "name price category image stock"
        })

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: customer.cart
        });
    } catch (error) {
        console.error("Update cart quantity error:", error);

        return res.status(500).json({
            success: false,
            message: "Sever error"
        });
    }
};

const removeFromCart = async (req, res) => {
    try{
        const {productId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            })
        }

        const customer = await Customer.findById(req.user._id);

        if(!customer) {
            return res.stauts(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const cartIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if(cartIndex === -1){
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        customer.cart.splice(cartIndex, 1);

        await customer.save();

        await customer.populate({
            path: "cart.product",
            select: "name price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: customer.cart
        });

    } catch (error) {
        console.error("Remove from cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

module.exports = {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
};