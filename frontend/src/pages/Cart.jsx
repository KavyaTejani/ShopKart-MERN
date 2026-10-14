import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";


function Cart() {
    const navigate = useNavigate();

    const {
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        refreshCart,
        updateQuantity,
        removeFromCart
    } = useCart();


    const formatPrice = (price) =>
        `₹${Number(price).toLocaleString("en-IN")}`;

   
    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    if (loading) {
        return (
            <main className="cart-page">
                <section className="cart-state">
                    <p>Loading your cart...</p>
                </section>
            </main>
        );
    }

    if (error) {
        return (
            <main className="cart-page">
                <section className="cart-state cart-error-state">
                    <h1>Unable to load your cart.</h1>

                    <p>
                        Something went wrong while retrieving
                        your cart.
                    </p>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={refreshCart}
                    >
                        Try Again
                    </button>
                </section>
            </main>
        );
    }

    const availableItems = cartItems.filter(
        (item) => item.product
    );

    if (availableItems.length === 0) {
        return (
            <main className="cart-page">
                <section className="cart-header">
                    <p className="eyebrow">
                        SHOPKART CART
                    </p>

                    <h1>My Cart</h1>
                </section>

                <section className="cart-state cart-empty-state">
                    <div className="cart-empty-icon">
                        🛒
                    </div>

                    <h2>Your cart is empty</h2>

                    <p>
                        Looks like you haven't added anything yet.
                    </p>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => navigate("/products")}
                    >
                        Browse Products
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <section className="cart-header">
                <p className="eyebrow">
                    SHOPKART CART
                </p>

                <h1>My Cart</h1>

                <p>
                    {availableItems.length}{" "}
                    {availableItems.length === 1
                        ? "product"
                        : "products"}{" "}
                    · {cartCount}{" "}
                    {cartCount === 1 ? "unit" : "units"}
                </p>
            </section>

            <div className="cart-layout">
                <section className="cart-items-section">
                    <h2 className="cart-section-title">
                        Your Items
                    </h2>

                    <div className="cart-items-list">
                        {availableItems.map((item) => (
                            <CartItem
                                key={item.product._id}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeFromCart}
                            />
                        ))}
                    </div>
                </section>

                <aside className="cart-summary">
                    <p className="eyebrow">
                        ORDER SUMMARY
                    </p>

                    <h2>Order Summary</h2>

                    <div className="cart-summary-row">
                        <span>Products</span>
                        <span>{availableItems.length}</span>
                    </div>

                    <div className="cart-summary-row">
                        <span>Total units</span>
                        <span>{cartCount}</span>
                    </div>

                    <div className="cart-summary-row cart-summary-total">
                        <span>Subtotal</span>
                        <strong>{formatPrice(subtotal)}</strong>
                    </div>

                    <p className="cart-summary-note">
                        Shipping and any applicable taxes
                        will be calculated during checkout.
                    </p>

                    <button
                        type="button"
                        className="primary-button cart-checkout-button"
                        onClick={() => navigate("/checkout")}
                    >
                        Proceed to Checkout
                    </button>

                </aside>
            </div>
        </main>
    );
}

export default Cart;
