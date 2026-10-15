import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Home() {

    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCustomer = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/customers/me");
            setCustomer(response.data);
        } catch (requestError) {
            setCustomer(null);

            if (requestError.response?.status === 401) {
                navigate("/login", { replace: true });
            } else {
                setError("We couldn't verify your session. Check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (!customer) {
        return (
            <main className="order-state">
                <h1>Unable to verify your session</h1>
                <p>{error || "Please log in to view this page."}</p>
                <button type="button" className="primary-button" onClick={() => navigate("/login", { replace: true })}>
                    Go to Login
                </button>
                {error && (
                    <button type="button" className="secondary-button" onClick={fetchCustomer}>
                        Try Again
                    </button>
                )}
            </main>
        );
    }

  return (
    <div className="page">

        <main className="home-container">

            <section className="welcome-section">
                <p className="eyebrow">SHOPKART ACCOUNT</p>

                <h1>Welcome to ShopKart</h1>

                <p className="welcome-text">
                    Your account information is shown below.
                </p>
            </section>

            {customer && (
                <section className="profile-card">

                    <div className="profile-header">
                        <div className="avatar">
                            {customer.fullName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <h2>{customer.fullName}</h2>
                            <p>Customer account</p>
                        </div>
                    </div>

                    <div className="profile-details">

                        <div className="detail-item">
                            <span className="detail-label">Email</span>
                            <span className="detail-value">
                                {customer.email}
                            </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Phone</span>
                            <span className="detail-value">
                                {customer.phone}
                            </span>
                        </div>

                    </div>

                </section>
            )}

        </main>
    </div>
);
}

export default Home;
