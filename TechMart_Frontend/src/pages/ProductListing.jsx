import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import AddressSelector from "../components/addressSelector";
import ScrollButtons from "../components/ScrollButtons";
import { useToast } from "../context/ToastContext";
import styles from "./ProductListing.module.css";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";

function ProductListing() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Filters state
    const [search, setSearch] = useState(() => searchParams.get("search") || "");
    const [selectedCategories, setSelectedCategories] = useState(() => {
        const cat = searchParams.get("category");
        return cat ? [Number(cat)] : [];
    });
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("featured");
    
    // Address Modal (Buy Now)
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    // Sidebar toggle
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [openSections, setOpenSections] = useState({
        categories: true,
        brands: true,
        price: true
    });

    const navigate = useNavigate();
    const { showToast } = useToast();

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        checkAuthAndLoadWishlist();
        loadCategories();
    }, []);

    const checkAuthAndLoadWishlist = async () => {
        try {
            const userRes = await api.get("/api/auth/me");
            if (userRes.data && userRes.data.role) {
                setIsAuthenticated(true);
                const isAdminUser = userRes.data.role === "ROLE_ADMIN";
                setIsAdmin(isAdminUser);
                if (!isAdminUser) {
                    const wishlistRes = await api.get("/api/wishlist");
                    setWishlist(wishlistRes.data);
                }
            }
        } catch (err) {
            setIsAuthenticated(false);
            setIsAdmin(false);
            setWishlist([]);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await api.get("/api/categories");
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    const loadProducts = async () => {
        try {
            const res = await api.get("/api/products");
            setProducts(res.data);
            console.log(res.data);
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleBrandChange = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand)
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        );
    };

    const handleAddToCart = async (productId) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        try {
            const res = await api.post("/api/cart/addToCart", {
                productId,
                quantity: 1
            });
            if (res.data === "ALREADY EXISTS") {
                showToast("This product is already in your cart.", "warning");
            } else {
                showToast("Product added to cart successfully!", "success");
            }
        } catch (error) {
            console.error("Add to cart failed:", error);
            showToast("Failed to add to cart.", "error");
        }
    };

    const handleAddToWishlist = async (productId) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        // Check if already in wishlist
        const existingItem = wishlist.find(item => item.productId === productId);
        if (existingItem) {
            // Remove from wishlist
            try {
                await api.post("/api/wishlist/removeItem", {
                    wishlistItemId: existingItem.wishlistItemId
                });
                showToast("Removed from Wishlist", "info");
                // Reload wishlist
                const wishlistRes = await api.get("/api/wishlist");
                setWishlist(wishlistRes.data);
            } catch (err) {
                console.error("Failed to remove from wishlist:", err);
            }
            return;
        }

        try {
            await api.post("/api/wishlist/add", { productId });
            showToast("Added to Wishlist", "success");
            // Reload wishlist
            const wishlistRes = await api.get("/api/wishlist");
            setWishlist(wishlistRes.data);
        } catch (error) {
            console.error("Failed to add to wishlist:", error);
            showToast("Failed to add to wishlist.", "error");
        }
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setMinPrice("");
        setMaxPrice("");
        setSortBy("featured");
        setSearchParams({});
    };

    // Extract unique brands from current products list
    const brands = [...new Set(products.map(p => {
        // Assume description might contain brand or just extract from name's first word as a fallback
        const firstWord = p.name.split(" ")[0];
        return firstWord;
    }))].filter(Boolean);

    // Apply filtering and sorting
    let filteredProducts = products.filter(product => {
        // 1. Category Filter
        if (selectedCategories.length > 0) {
            const prodCategoryId = product.categoryId || product.category?.id;
            const hasMatch = prodCategoryId && selectedCategories.some(id => String(id) === String(prodCategoryId));
            if (!hasMatch) {
                return false;
            }
        }

        // 2. Brand Filter
        if (selectedBrands.length > 0) {
            const productBrand = product.name.split(" ")[0];
            const hasMatch = selectedBrands.some(brand => String(brand).toLowerCase() === String(productBrand).toLowerCase());
            if (!hasMatch) {
                return false;
            }
        }

        // 3. Price Filter
        if (minPrice !== "" && product.price < Number(minPrice)) {
            return false;
        }
        if (maxPrice !== "" && product.price > Number(maxPrice)) {
            return false;
        }

        return true;
    });

    // Apply Sorting
    if (sortBy === "priceLowHigh") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHighLow") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "nameAZ") {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "nameZA") {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    }

    const searchProducts = async (search) => {
        try {
            const res = await api.get("/api/products/search", {
                params: {
                    name: search
                }
            });
            setProducts(res.data);
        }
        catch (err) {
            console.log(err);
            showToast("Failed to load searched items", "error");
        }
    }

    // Debouncing: 
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            if (search.trim() === "") {
                loadProducts();
            } else {
                searchProducts(search);
            }
            return;
        }

        const timer = setTimeout(() =>{
            if (search.trim() === "") {
                loadProducts();
            }
            else {
                searchProducts(search);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const isSearching = search.trim() !== "";

    return (
        <div className={styles.listingPage}>
            <Navbar searchVal={search} setSearchVal={setSearch} />

            <main className={styles.content}>
                <h1>Explore Tech</h1>
                <p>Find the best next-gen gadgets tailored to your needs</p>

                <div className={`${styles.layout} ${!sidebarOpen ? styles.layoutCollapsed : ''}`}>
                    {/* Sidebar Toggle Button */}
                    <button
                        className={styles.sidebarToggle}
                        onClick={() => setSidebarOpen(prev => !prev)}
                        aria-label={sidebarOpen ? 'Close filters' : 'Open filters'}
                    >
                        <FiFilter size={18} style={{ marginRight: "6px" }} />
                        {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {/* Sidebar Filters */}
                    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
                        <div className={styles.filterSection}>
                            <h3
                                className={styles.filterTitle}
                                onClick={() => toggleSection('categories')}
                            >
                                Categories
                                <span className={`${styles.filterArrow} ${openSections.categories ? styles.filterArrowOpen : ''}`}>▾</span>
                            </h3>
                            <div className={`${styles.checkboxList} ${openSections.categories ? styles.sectionOpen : styles.sectionClosed}`}>
                                {categories.map(category => (
                                    <label key={category.id} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkboxInput}
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={() => handleCategoryChange(category.id)}
                                        />
                                        {category.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterSection}>
                            <h3
                                className={styles.filterTitle}
                                onClick={() => toggleSection('brands')}
                            >
                                Brands
                                <span className={`${styles.filterArrow} ${openSections.brands ? styles.filterArrowOpen : ''}`}>▾</span>
                            </h3>
                            <div className={`${styles.checkboxList} ${openSections.brands ? styles.sectionOpen : styles.sectionClosed}`}>
                                {brands.map(brand => (
                                    <label key={brand} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkboxInput}
                                            checked={selectedBrands.includes(brand)}
                                            onChange={() => handleBrandChange(brand)}
                                        />
                                        {brand}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterSection}>
                            <h3
                                className={styles.filterTitle}
                                onClick={() => toggleSection('price')}
                            >
                                Price Range
                                <span className={`${styles.filterArrow} ${openSections.price ? styles.filterArrowOpen : ''}`}>▾</span>
                            </h3>
                            <div className={`${styles.priceRangeInputs} ${openSections.price ? styles.sectionOpen : styles.sectionClosed}`}>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className={styles.priceInput}
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                                <span className={styles.priceDivider}>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className={styles.priceInput}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <button className={styles.clearAllBtn} onClick={clearAllFilters}>
                            Clear All Filters
                        </button>
                    </aside>

                    {/* Main Products Listing Area */}
                    <section className={styles.mainContent}>
                        {/* Toolbar */}
                        <div className={styles.toolbar}>
                            <div className={styles.resultsCount}>
                                Showing <strong>{filteredProducts.length}</strong> products
                                {search && <span> for "{search}"</span>}
                            </div>

                            <select
                                className={styles.sortSelect}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="featured">Sort by: Featured</option>
                                <option value="priceLowHigh">Price: Low to High</option>
                                <option value="priceHighLow">Price: High to Low</option>
                                <option value="nameAZ">Name: A to Z</option>
                                <option value="nameZA">Name: Z to A</option>
                            </select>
                        </div>

                        {/* Active Filter Chips */}
                        {(selectedCategories.length > 0 || selectedBrands.length > 0 || minPrice !== "" || maxPrice !== "") && (
                            <div className={styles.activeFilters}>
                                <span className={styles.activeFiltersTitle}>Active Filters:</span>
                                {selectedCategories.map(catId => {
                                    const cat = categories.find(c => c.id === catId);
                                    return cat ? (
                                        <span key={catId} className={styles.chip}>
                                            {cat.name}
                                            <button className={styles.clearChipBtn} onClick={() => handleCategoryChange(catId)}>
                                                <FiX size={14} />
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                                {selectedBrands.map(brand => (
                                    <span key={brand} className={styles.chip}>
                                        {brand}
                                        <button className={styles.clearChipBtn} onClick={() => handleBrandChange(brand)}>
                                            <FiX size={14} />
                                        </button>
                                    </span>
                                ))}
                                {(minPrice !== "" || maxPrice !== "") && (
                                    <span className={styles.chip}>
                                        ₹{minPrice || "0"} - ₹{maxPrice || "∞"}
                                        <button className={styles.clearChipBtn} onClick={() => { setMinPrice(""); setMaxPrice(""); }}>
                                            <FiX size={14} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Product Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className={styles.emptyState}>
                                <FiSearch size={64} className={styles.emptyIcon} style={{ marginBottom: "16px" }} />
                                <h3 className={styles.emptyTitle}>No products match your filters</h3>
                                <p className={styles.emptyDesc}>Try adjusting your checkboxes, search terms, or price ranges.</p>
                                <button className={styles.emptyBtn} onClick={clearAllFilters}>Reset Filters</button>
                            </div>
                        ) : (
                            <div className={styles.productsGrid}>
                                {filteredProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                        onAddToWishlist={handleAddToWishlist}
                                        isWishlisted={wishlist.some(item => item.productId === product.id)}
                                        showActions={!isAdmin}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {showAddressModal && (
                <AddressSelector
                    productId={selectedProductId}
                    onClose={() => setShowAddressModal(false)}
                    onPlaceOrder={placeOrder}
                />
            )}

            <ScrollButtons />

            <Footer />
        </div>
    );
}

export default ProductListing;
