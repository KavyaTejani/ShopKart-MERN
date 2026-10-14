import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {

    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchWishlist = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/wishlist");

            setWishlist(response.data.wishlist);

        } catch (error) {

            console.error(
                "Failed to fetch wishlist:",
                error
            );

            setError(
                "Something went wrong while loading your wishlist."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (productId) => {
        try {
            const response = await api.delete(`/wishlist/${productId}`);

            setWishlist((currentWishlist) =>
                currentWishlist.filter(
                    (product) => product._id !== productId
                )
            );

            window.dispatchEvent(
                new CustomEvent("wishlistUpdated", {
                    detail: {
                        count: response.data.count
                    }
                })
            );
        } catch (error) {
            console.error(
                "Failed to remove product from wishlist:",
                error
            );
        }
    };

    if (loading) {
        return (
            <main className="wishlist-page">
                <p>Loading your wishlist...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="wishlist-page">

                <section className="wishlist-error">

                    <h2>
                        Something went wrong.
                    </h2>

                    <p>
                        We couldn't load your wishlist.
                    </p>

                    <button
                        className="primary-button"
                        onClick={fetchWishlist}
                    >
                        Try Again
                    </button>

                </section>

            </main>
        );
    }

    return (
        <main className="wishlist-page">

            <section className="wishlist-header">

                <p className="eyebrow">
                    SHOPKART WISHLIST
                </p>

                <h1>
                    My Wishlist
                </h1>

                <p>
                    {wishlist.length}{" "}
                    {wishlist.length === 1
                        ? "product"
                        : "products"}{" "}
                    saved
                </p>

            </section>

            {wishlist.length === 0 ? (
                <section className="wishlist-empty">


                    <h2>
                        Your wishlist is empty
                    </h2>

                    <p>
                        Start saving products you love and
                        find them here later.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() => navigate("/products")}
                    >
                        Browse Products
                    </button>

                </section>
            ) : (
                <section className="wishlist-grid">

                    {wishlist.map((product) => (
                        <WishlistCard
                            key={product._id}
                            product={product}
                            onRemove={handleRemove}
                        />
                    ))}

                </section>
            )}

        </main>
    );
}

export default Wishlist;