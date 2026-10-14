import { useState } from "react";

function CartItem({ item, onUpdateQuantity, onRemove }) {
    const [busyAction, setBusyAction] = useState("");
    const [actionError, setActionError] = useState("");

    const product = item.product;
    const quantity = item.quantity;

    const formatPrice = (price) =>
        `₹${Number(price).toLocaleString("en-IN")}`;

    const handleQuantityChange = async (newQuantity) => {
        if (
            !product ||
            newQuantity < 1 ||
            newQuantity > product.stock ||
            busyAction
        ) {
            return;
        }

        try {
            setBusyAction("quantity");
            setActionError("");

            await onUpdateQuantity(product._id, newQuantity);
        } catch (error) {
            console.error("Failed to update quantity:", error);

            setActionError(
                error.response?.data?.message ||
                "Unable to update quantity. Please try again."
            );
        } finally {
            setBusyAction("");
        }
    };

    const handleRemove = async () => {
        if (!product || busyAction) {
            return;
        }

        try {
            setBusyAction("remove");
            setActionError("");

            await onRemove(product._id);
        } catch (error) {
            console.error("Failed to remove cart item:", error);

            setActionError(
                error.response?.data?.message ||
                "Unable to remove this product. Please try again."
            );

            setBusyAction("");
        }
    };

    if (!product) {
        return (
            <article className="cart-item cart-item-unavailable">
                <p>This product is no longer available.</p>
                <p>Please refresh the cart or contact support.</p>
            </article>
        );
    }

    return (
        <article className="cart-item">
            <div className="cart-item-image-wrapper">
                <img
                    src={product.image}
                    alt={product.name}
                    className="cart-item-image"
                />
            </div>

            <div className="cart-item-content">
                <p className="product-category">
                    {product.category}
                </p>

                <h2 className="cart-item-name">
                    {product.name}
                </h2>

                <p className="cart-item-unit-price">
                    {formatPrice(product.price)} per unit
                </p>

                <p className="cart-item-stock">
                    {product.stock > 0
                        ? `${product.stock} units available`
                        : "Out of stock"}
                </p>

                <div className="cart-item-bottom">
                    <div className="cart-quantity-controls">
                        <button
                            type="button"
                            className="cart-quantity-button"
                            aria-label={`Decrease ${product.name} quantity`}
                            onClick={() =>
                                handleQuantityChange(quantity - 1)
                            }
                            disabled={
                                busyAction !== "" ||
                                quantity <= 1
                            }
                        >
                            −
                        </button>

                        <span
                            className="cart-quantity-value"
                            aria-live="polite"
                        >
                            {quantity}
                        </span>

                        <button
                            type="button"
                            className="cart-quantity-button"
                            aria-label={`Increase ${product.name} quantity`}
                            onClick={() =>
                                handleQuantityChange(quantity + 1)
                            }
                            disabled={
                                busyAction !== "" ||
                                quantity >= product.stock
                            }
                        >
                            +
                        </button>
                    </div>

                    <p className="cart-item-subtotal">
                        {formatPrice(product.price * quantity)}
                    </p>
                </div>

                <button
                    type="button"
                    className="cart-remove-button"
                    onClick={handleRemove}
                    disabled={busyAction !== ""}
                >
                    {busyAction === "remove"
                        ? "Removing..."
                        : "Remove"}
                </button>

                {busyAction === "quantity" && (
                    <p className="cart-action-status">
                        Updating quantity...
                    </p>
                )}

                {actionError && (
                    <p
                        className="cart-action-error"
                        role="alert"
                    >
                        {actionError}
                    </p>
                )}
            </div>
        </article>
    );
}

export default CartItem;