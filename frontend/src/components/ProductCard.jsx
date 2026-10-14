
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../services/api";

function ProductCard({
    product,
    isWishlisted,
    onWishlistChange
}) {
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [wishlistError, setWishlistError] = useState("");

    const { addToCart } = useCart();

    const [addingToCart, setAddingToCart] = useState(false);
    const [cartError, setCartError] = useState("");

    const handleViewDetails = () => {
        navigate(`/products/${product._id}`);
    };

    const handleToggleWishlist = async () => {
        try {
            setSaving(true);
            setWishlistError("");

            const response = await api.patch(
                `/wishlist/${product._id}/toggle`
            );

            const { saved, count } = response.data;

            onWishlistChange(product._id, saved);

            window.dispatchEvent(
                new CustomEvent("wishlistUpdated", {
                    detail: { count }
                })
            );
        } catch (error) {
            console.error("Failed to toggle wishlist:", error);

            if (error.response?.status === 401) {
                setWishlistError("Please log in to use your wishlist.");
            } else {
                setWishlistError(
                    "Unable to update wishlist. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };
    const handleAddToCart = async () => {
        try {
            setAddingToCart(true);
            setCartError("");

            await addToCart(product._id);

        } catch (error) {
            console.error("Failed to add product to cart:", error);

            setCartError(
                error.response?.data?.message ||
                "Unable to add product to cart. Please try again."
            );

        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <article className="product-card">
            <div className="product-image-wrapper">
                <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                />
            </div>

            <div className="product-card-content">
                <p className="product-category">
                    {product.category}
                </p>

                <h2 className="product-name">
                    {product.name}
                </h2>

                <p className="product-price">
                    ₹{product.price.toLocaleString("en-IN")}
                </p>

                <p className="product-stock">
                    {product.stock > 0
                        ? `${product.stock} units left`
                        : "Out of stock"}
                </p>

                <div className="product-card-actions">
                    <button
                        className="primary-button"
                        onClick={handleViewDetails}
                    >
                        View Details
                    </button>

                    <button
                        className="wishlist-button"
                        onClick={handleToggleWishlist}
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : isWishlisted
                                ? "Remove from Wishlist"
                                : "Add to Wishlist"}
                    </button>
                    <button
                        className="cart-button"
                        onClick={handleAddToCart}
                        disabled={addingToCart || product.stock === 0}
                    >
                        {product.stock === 0
                            ? "Out of Stock"
                            : addingToCart
                                ? "Adding..."
                                : "Add to Cart"}
                    </button>
                </div>

                {wishlistError && (
                    <p className="wishlist-error" role="alert">
                        {wishlistError}
                    </p>
                )}
                {cartError && (
                    <p className="cart-error" role="alert">
                        {cartError}
                    </p>
                )}
            </div>
        </article>
    );
}

export default ProductCard;
