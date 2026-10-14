
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/products/${id}`);

                setProduct(response.data.product);
            } catch (error) {
                console.error("Failed to fetch product:", error);

                if (error.response?.status === 404) {
                    setError("Product not found.");
                } else if (error.response?.status === 400) {
                    setError("Invalid product ID.");
                } else {
                    setError(
                        "Something went wrong while loading the product."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        try {
            setAddingToCart(true);
            setCartError("");
            setCartMessage("");

            await addToCart(product._id);

            setCartMessage("Product added to your cart.");
        } catch (error) {
            console.error("Failed to add product to cart:", error);

            if (error.response?.status === 401) {
                setCartError("Please log in to add products to your cart.");
            } else {
                setCartError(
                    error.response?.data?.message ||
                    "Unable to add product to cart. Please try again."
                );
            }
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <main className="product-details-page">
                <p>Loading product...</p>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="product-details-page">
                <section className="product-details-error">
                    <h1>{error || "Product not found."}</h1>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => navigate("/products")}
                    >
                        Back to Products
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="product-details-page">
            <button
                type="button"
                className="back-button"
                onClick={() => navigate("/products")}
            >
                ← Back to Products
            </button>

            <section className="product-details">
                <div className="product-details-image-wrapper">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-details-image"
                    />
                </div>

                <div className="product-details-content">
                    <p className="product-category">
                        {product.category}
                    </p>

                    <h1>{product.name}</h1>

                    <p className="product-details-description">
                        {product.description}
                    </p>

                    <p className="product-details-price">
                        ₹{product.price.toLocaleString("en-IN")}
                    </p>

                    <p className="product-details-stock">
                        {product.stock > 0
                            ? `${product.stock} units available`
                            : "Out of stock"}
                    </p>

                    <button
                        type="button"
                        className="primary-button add-to-cart-button"
                        onClick={handleAddToCart}
                        disabled={addingToCart || product.stock === 0}
                    >
                        {product.stock === 0
                            ? "Out of Stock"
                            : addingToCart
                                ? "Adding..."
                                : "Add to Cart"}
                    </button>

                    {cartMessage && (
                        <p className="cart-success" role="status">
                            {cartMessage}
                        </p>
                    )}

                    {cartError && (
                        <p className="cart-error" role="alert">
                            {cartError}
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default ProductDetails;
