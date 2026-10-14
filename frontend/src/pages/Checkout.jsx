import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../services/api.js";

const initialAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
};

const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
        existing.addEventListener("load", () => resolve(true), { once: true });
        existing.addEventListener("error", () => resolve(false), { once: true });
        return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => {
        script.remove();
        resolve(false);
    };
    document.body.appendChild(script);
});

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, loading, error: cartError, subtotal, refreshCart, clearCart } = useCart();
    const [address, setAddress] = useState(initialAddress);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);
    const availableItems = cartItems.filter((item) => item.product);
    const displayedTotal = availableItems.reduce(
        (total, item) => total + Number(item.product.price) * item.quantity, 0
    );

    useEffect(() => { refreshCart(); }, [refreshCart]);

    const validate = () => {
        const nextErrors = {};
        for (const [field, value] of Object.entries(address)) {
            if (!value.trim()) nextErrors[field] = "This field is required.";
        }
        if (address.phone.trim() && !/^\+?[\d\s().-]{7,20}$/.test(address.phone.trim())) {
            nextErrors.phone = "Enter a valid phone number.";
        }
        if (address.pincode.trim() && !/^\d{6}$/.test(address.pincode.trim())) {
            nextErrors.pincode = "Pincode must contain 6 digits.";
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        if (!validate()) return;
        if (!availableItems.length) {
            setMessage("Your cart is empty. Add products before checkout.");
            return;
        }

        setPlacingOrder(true);
        let orderId;
        try {
            const response = await api.post("/orders/create-payment-order", {
                shippingAddress: Object.fromEntries(
                    Object.entries(address).map(([field, value]) => [field, value.trim()])
                )
            });
            const paymentData = response.data;
            orderId = paymentData.shopKartOrderId;

            const scriptLoaded = await loadRazorpay();
            if (!scriptLoaded || !window.Razorpay) {
                throw new Error("Unable to load Razorpay Checkout. Please try again.");
            }

            const checkout = new window.Razorpay({
                key: paymentData.key,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: "ShopKart",
                description: "ShopKart Order",
                order_id: paymentData.razorpayOrderId,
                prefill: { name: address.fullName.trim(), contact: address.phone.trim() },
                handler: async (paymentResponse) => {
                    try {
                        const verified = await api.post("/orders/verify-payment", {
                            shopKartOrderId: orderId,
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature
                        });
                        clearCart();
                        navigate(`/order-success/${verified.data.order._id}`, { replace: true });
                    } catch (verificationError) {
                        setMessage(verificationError.response?.data?.message || "Payment verification failed. Your cart has not been cleared.");
                        setPlacingOrder(false);
                    }
                },
                modal: {
                    ondismiss: () => setPlacingOrder(false)
                },
                theme: { color: "#161616" }
            });
            checkout.on("payment.failed", (paymentError) => {
                setMessage(paymentError.error?.description || "Payment failed. Your cart has not been cleared. Please try again.");
                setPlacingOrder(false);
            });
            checkout.open();
        } catch (requestError) {
            setMessage(requestError.response?.data?.message || requestError.message || "Unable to start checkout. Your cart has not been changed.");
            setPlacingOrder(false);
        }
    };

    if (loading) return <main className="checkout-page"><p>Loading your cart...</p></main>;
    if (cartError) return <main className="checkout-page"><section className="order-state"><h1>Unable to load checkout</h1><p>{cartError}</p><button className="primary-button" onClick={refreshCart}>Try Again</button></section></main>;
    if (!availableItems.length) return <main className="checkout-page"><section className="order-state"><h1>Your cart is empty</h1><p>Add products before starting checkout.</p><button className="primary-button" onClick={() => navigate("/products")}>Browse Products</button></section></main>;

    const fields = [
        ["fullName", "Full Name", "text"], ["phone", "Phone Number", "tel"],
        ["addressLine1", "Address Line", "text"], ["city", "City", "text"],
        ["state", "State", "text"], ["pincode", "Pincode", "text"]
    ];

    return (
        <main className="checkout-page">
            <header className="orders-header"><p className="eyebrow">SHOPKART CHECKOUT</p><h1>Shipping and payment</h1><p>Confirm your delivery details and review your order.</p></header>
            <div className="checkout-layout">
                <form className="checkout-form order-panel" onSubmit={handleSubmit} noValidate>
                    <h2>Shipping details</h2>
                    {fields.map(([field, label, type]) => (
                        <div className="checkout-field" key={field}>
                            <label htmlFor={field}>{label}</label>
                            <input id={field} name={field} type={type} value={address[field]} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `${field}-error` : undefined} onChange={(event) => {
                                setAddress((current) => ({ ...current, [field]: event.target.value }));
                                setErrors((current) => ({ ...current, [field]: "" }));
                            }} />
                            {errors[field] && <small id={`${field}-error`} className="field-error">{errors[field]}</small>}
                        </div>
                    ))}
                    <p className="checkout-payment-note">Payment is processed securely through Razorpay Test Mode.</p>
                    {message && <p className="order-error" role="alert">{message}</p>}
                    <button type="submit" className="primary-button" disabled={placingOrder}>{placingOrder ? "Waiting for payment..." : "Place Order · Pay Securely"}</button>
                </form>
                <aside className="order-panel checkout-summary">
                    <h2>Order summary</h2>
                    {availableItems.map(({ product, quantity }) => <div className="checkout-summary-item" key={product._id}><span>{product.name} × {quantity}</span><strong>₹{(product.price * quantity).toLocaleString("en-IN")}</strong></div>)}
                    <div className="checkout-summary-total"><span>Total</span><strong>₹{displayedTotal.toLocaleString("en-IN")}</strong></div>
                    <p className="checkout-payment-note">Final price and stock are rechecked by the server before payment.</p>
                    {subtotal !== displayedTotal && <p className="checkout-payment-note">Prices may have changed; the server total is authoritative.</p>}
                </aside>
            </div>
        </main>
    );
}

export default Checkout;
