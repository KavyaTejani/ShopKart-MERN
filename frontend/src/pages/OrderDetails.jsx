import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";

const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;
const formatDate = (date) => new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short" }).format(new Date(date));

function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrder = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data.order);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load this order.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { loadOrder(); }, [loadOrder]);

    if (loading) return <main className="orders-page"><section className="order-state"><p>Loading order details...</p></section></main>;
    if (error || !order) return <main className="orders-page"><section className="order-state"><h1>Order unavailable</h1><p>{error || "Order not found."}</p><button className="primary-button" onClick={() => navigate("/orders")}>Go to My Orders</button></section></main>;

    return (
        <main className="orders-page">
            <header className="orders-header"><p className="eyebrow">{order.paymentStatus === "PAID" ? "PAYMENT CONFIRMED" : "ORDER DETAILS"}</p><h1>{order.paymentStatus === "PAID" ? "Order placed successfully" : "Order details"}</h1><p>Order #{order._id}</p></header>
            <article className="order-panel order-detail-card">
                <div className="order-card-heading"><div><h2>Purchase summary</h2><p className="order-date">Placed {formatDate(order.createdAt)}</p></div><span className={`order-status order-status-${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span></div>
                <ul className="order-item-list">{order.items.map((item, index) => <li key={`${item.product}-${index}`}><span>{item.name} × {item.quantity}<small>{formatPrice(item.price)} each</small></span><strong>{formatPrice(item.price * item.quantity)}</strong></li>)}</ul>
                <div className="checkout-summary-total"><span>Total paid</span><strong>{formatPrice(order.totalAmount)}</strong></div>
                <section className="shipping-details"><h2>Shipping address</h2><p>{order.shippingAddress.fullName}<br />{order.shippingAddress.addressLine1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />{order.shippingAddress.phone}</p></section>
                <div className="order-detail-actions"><button className="secondary-button" onClick={() => navigate("/orders")}>View My Orders</button><button className="primary-button" onClick={() => navigate("/products")}>Continue Shopping</button></div>
            </article>
        </main>
    );
}

export default OrderDetails;
