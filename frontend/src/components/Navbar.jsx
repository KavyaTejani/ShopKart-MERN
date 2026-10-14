
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useCart } from "../context/CartContext";

function Navbar() {
    const navigate = useNavigate();

    const { cartCount } = useCart();

    const [wishlistCount, setWishlistCount] = useState(null);

    useEffect(() => {
        const fetchWishlistCount = async () => {
            try {
                const response = await api.get("/wishlist");
                setWishlistCount(response.data.count);
            } catch (error) {
                setWishlistCount(null);
            }
        };

        const handleWishlistUpdated = (event) => {
            setWishlistCount(event.detail.count);
        };

        fetchWishlistCount();

        window.addEventListener(
            "wishlistUpdated",
            handleWishlistUpdated
        );

        return () => {
            window.removeEventListener(
                "wishlistUpdated",
                handleWishlistUpdated
            );
        };
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/customers/logout");

            navigate("/login", {
                replace: true
            });
        } catch (error) {
            console.log("Logout failed:", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">

                <button
                    className="navbar-brand"
                    onClick={() => navigate("/home")}
                >
                    ShopKart
                </button>

                <div className="navbar-links">

                    <button
                        className="navbar-link"
                        onClick={() => navigate("/home")}
                    >
                        Home
                    </button>

                    <button
                        className="navbar-link"
                        onClick={() => navigate("/products")}
                    >
                        Products
                    </button>

                    <button
                        className="navbar-link"
                        onClick={() => navigate("/wishlist")}
                    >
                        Wishlist
                        {wishlistCount !== null &&
                            ` (${wishlistCount})`}
                    </button>

                    <button
                        className="navbar-link"
                        onClick={() => navigate("/cart")}
                    >
                        Cart ({cartCount})
                    </button>

                    <button className="navbar-link" onClick={() => navigate("/orders")}>
                        My Orders
                    </button>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>
            </div>
        </nav>
    );
}

export default Navbar;
