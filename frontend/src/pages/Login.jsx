import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../services/api.js";

function Login() {

    const navigate = useNavigate();

    const {refreshCart} = useCart();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {

        const checkAuthentication = async () => {

            try {

                await api.get("/customers/me");

                navigate("/home", {
                    replace: true
                });

            } catch (error) {

                setCheckingAuth(false);

            }
        };

        checkAuthentication();

    }, [navigate]);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            await api.post(
                "/customers/login",
                formData
            );

            navigate("/home", {
                replace: true
            });

        } catch (error) {

            setError("Invalid credentials");

        } finally {

            setLoading(false);

        }
    };

    if (checkingAuth) {
        return (
            <main className="auth-page">
                <p>Checking authentication...</p>
            </main>
        );
    }

    return (
        <main className="auth-page">

            <section className="auth-card">

                <div className="auth-header">

                    <p className="eyebrow">
                        SHOPKART
                    </p>

                    <h1>
                        Welcome back
                    </h1>

                    <p>
                        Login to access your ShopKart account.
                    </p>

                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                        />

                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                <p className="auth-footer">

                    Don't have an account?{" "}

                    <button
                        type="button"
                        className="text-button"
                        onClick={() => navigate("/register")}
                    >
                        Create one
                    </button>

                </p>

            </section>

        </main>
    );
}

export default Login;