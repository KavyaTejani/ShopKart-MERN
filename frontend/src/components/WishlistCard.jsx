import { useNavigate } from "react-router-dom";

function WishlistCard({ product, onRemove }) {

    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/products/${product._id}`);
    };

    return (
        <article className="wishlist-card">

            <div className="wishlist-image-wrapper">
                <img
                    src={product.image}
                    alt={product.name}
                    className="wishlist-image"
                />
            </div>

            <div className="wishlist-card-content">

                <p className="product-category">
                    {product.category}
                </p>

                <h2 className="wishlist-product-name">
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

                <div className="wishlist-card-actions">

                    <button
                        className="primary-button"
                        onClick={handleViewDetails}
                    >
                        View Details
                    </button>

                    <button
                        className="wishlist-remove-button"
                        onClick={() => onRemove(product._id)}
                    >
                        Remove from Wishlist
                    </button>

                </div>

            </div>

        </article>
    );
}

export default WishlistCard;