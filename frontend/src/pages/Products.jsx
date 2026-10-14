import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

function Products() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const [wishlistIds, setWishlistIds] = useState([]);

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                setLoading(true);
                setError("");

                const params = {};

                if (search.trim()) {
                    params.search = search.trim();
                }

                if (category) {
                    params.category = category;
                }

                const response = await api.get("/products", {
                    params
                });

                setProducts(response.data.products);

            } catch (error) {

                console.error(
                    "Failed to fetch products:",
                    error
                );

                setError(
                    "Something went wrong while loading products."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchProducts();

    }, [search, category]);

    useEffect(() => {

        const fetchWishlist = async () => {

            try {

                const response = await api.get("/wishlist");

                const ids = response.data.wishlist.map(
                    (product) => product._id
                );

                setWishlistIds(ids);

            } catch (error) {

                if (error.response?.status !== 401) {
                    console.error(
                        "Failed to fetch wishlist:",
                        error
                    );
                }

                setWishlistIds([]);

            }
        };

        fetchWishlist();

    }, []);

    const handleWishlistChange = (productId, saved) => {

        setWishlistIds((currentIds) => {

            if (saved) {

                if (currentIds.includes(productId)) {
                    return currentIds;
                }

                return [...currentIds, productId];
            }

            return currentIds.filter(
                (id) => id !== productId
            );
        });
    };

    return (
        <main className="products-page">

            <section className="products-header">

                <p className="eyebrow">
                    SHOPKART CATALOG
                </p>

                <h1>
                    Find your next product.
                </h1>

                <p>
                    Browse the latest products available in ShopKart.
                </p>

            </section>

            <SearchBar
                search={search}
                category={category}
                onSearchChange={setSearch}
                onCategoryChange={setCategory}
            />

            {loading && (
                <p>Loading products...</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            {!loading &&
                !error &&
                products.length === 0 && (
                    <p>No products found.</p>
                )}

            {!loading &&
                !error &&
                products.length > 0 && (

                    <section className="products-grid">

                        {products.map((product) => (

                            <ProductCard
                                key={product._id}
                                product={product}
                                isWishlisted={
                                    wishlistIds.includes(
                                        product._id
                                    )
                                }
                                onWishlistChange={
                                    handleWishlistChange
                                }
                            />

                        ))}

                    </section>

                )}

        </main>
    );
}

export default Products;