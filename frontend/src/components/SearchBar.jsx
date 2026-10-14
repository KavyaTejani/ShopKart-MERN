function SearchBar({
    search,
    category,
    onSearchChange,
    onCategoryChange
}) {

    return (
        <section className="search-bar">

            <div className="search-field">

                <label htmlFor="product-search">
                    Search
                </label>

                <input
                    id="product-search"
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />

            </div>

            <div className="category-field">

                <label htmlFor="product-category">
                    Category
                </label>

                <select
                    id="product-category"
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                >
                    <option value="">
                        All Categories
                    </option>

                    <option value="Electronics">
                        Electronics
                    </option>

                    <option value="Fashion">
                        Fashion
                    </option>

                    <option value="Books">
                        Books
                    </option>

                    <option value="Home">
                        Home
                    </option>
                </select>

            </div>

        </section>
    );
}

export default SearchBar;