
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refreshCart = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/cart");

            setCartItems(response.data.cart ?? []);

        } catch (error) {

            if (error.response?.status === 401) {

                setCartItems([]);
                setError("");

            } else {

                console.error("Failed to fetch cart:", error);

                setError(
                    "Unable to load your cart. Please try again."
                );

            }

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addToCart = async (productId) => {

        const response = await api.post(`/cart/${productId}`);

        setCartItems(response.data.cart);

        return response.data;
    };

    const removeFromCart = async (productId) => {

        const response = await api.delete(`/cart/${productId}`);

        setCartItems(response.data.cart);

        return response.data;
    };

    const updateQuantity = async (productId, quantity) => {

        const response = await api.patch(
            `/cart/${productId}`,
            { quantity }
        );

        setCartItems(response.data.cart);

        return response.data;
    };

    const clearCart = useCallback(() => {
        setCartItems([]);
        setError("");
    }, []);

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = cartItems.reduce(
        (total, item) =>
            total + (item.product ? item.product.price * item.quantity : 0),
        0
    );

    const contextValue = useMemo(() => ({
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
        clearCart
    }), [
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        refreshCart,
        clearCart
    ]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}
export function useCart() {

    const context = useContext(CartContext);

    if (context === null) {
        throw new Error(
            "useCart must be used inside CartProvider"
        );
    }

    return context;
}
