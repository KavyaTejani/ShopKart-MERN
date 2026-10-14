import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Home() {

    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchCustomer = async () => {

            try {

                const response = await api.get("/customers/me");

                setCustomer(response.data);

            } catch (error) {

                if (error.response?.status === 401) {
                    navigate("/login");
                }

            } finally {

                setLoading(false);

            }
        };

        fetchCustomer();

    }, [navigate]);

    if (loading) {
        return <h1>Loading...</h1>;
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