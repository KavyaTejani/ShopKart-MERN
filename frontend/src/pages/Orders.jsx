import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;
const formatDate = (date) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(date));

function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/orders");
            setOrders(response.data.orders || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load your orders.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    return (
        <main className="orders-page">
            <header className="orders-header"><p className="eyebrow">SHOPKART ACCOUNT</p><h1>My Orders</h1><p>Your ShopKart purchase history.</p></header>
            {loading ? <section className="order-state"><p>Loading your orders...</p></section> : error ? (
                <section className="order-state"><h2>We couldn't load your orders.</h2><p>{error}</p><button className="primary-button" onClick={loadOrders}>Try Again</button></section>
            ) : orders.length === 0 ? (
                <section className="order-state"><h2>You have not placed any orders yet.</h2><p>Your completed purchases will appear here.</p><button className="primary-button" onClick={() => navigate("/products")}>Start Shopping</button></section>
            ) : (
                <section className="orders-list">{orders.map((order) => (
                    <article className="order-panel order-card" key={order._id}>
                        <div className="order-card-heading"><div><p className="eyebrow">ORDER #{order._id.slice(-8).toUpperCase()}</p><p className="order-date">{formatDate(order.createdAt)}</p></div><span className={`order-status order-status-${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span></div>
                        <ul className="order-item-list">{order.items.map((item, index) => <li key={`${item.product}-${index}`}><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></li>)}</ul>
                        <div className="order-card-footer"><strong>Total: {formatPrice(order.totalAmount)}</strong><button className="secondary-button" onClick={() => navigate(`/orders/${order._id}`)}>View Details</button></div>
                    </article>
                ))}</section>
            )}
        </main>
    );
}

export default Orders;
