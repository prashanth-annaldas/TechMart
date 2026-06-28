import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import AddressSelector from "../components/addressSelector";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useToast } from "../context/ToastContext";
import styles from "./Home.module.css";
import ScrollButtons from "../components/ScrollButtons";

const categoryIcons = {
    laptops: "💻", phones: "📱", audio: "🎧",
    wearables: "⌚", tvs: "📺", cameras: "📷",
    accessories: "🎮", tablets: "📱", default: "🛍️"
};

const heroSlides = [
    {
        url: "https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/34b5bf180145769.6505ae7623131.jpg",
        alt: "Premium Tech Collection"
    },
    {
        url: "https://laptopmedia.com/wp-content/uploads/2021/02/EsAmZ7rXYAAXaX5.jpg",
        alt: "Latest Laptops"
    },
    {
        url: "https://th-i.thgim.com/public/sci-tech/technology/gadgets/509kmg/article68547022.ece/alternates/FREE_1200/b2b29b8a-d1d4-584a-ad32-f2646e286c24.jpeg",
        alt: "Smart Gadgets"
    }
];

const getCategoryIcon = (name) => {
    const key = name.toLowerCase();
    for (const [k, v] of Object.entries(categoryIcons)) {
        if (key.includes(k)) return v;
    }
    return categoryIcons.default;
};

const Home = () => {

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [addresses, setAddress] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [searchVal, setSearchVal] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Hero slider
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroSlides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index) => setCurrentSlide(index);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % heroSlides.length);

    const checkAuthAndWishlist = async () => {
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

    const loadProducts = async () => {
        try {
            const res = await api.get("/api/products");

            setProducts(res.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        checkAuthAndWishlist();
        getAllAddresses();
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await api.get("/api/categories");
            console.log(res.data);
            setCategories(res.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    const searchProducts = async (searchVal) => {
        try {
            const res = await api.get("/api/products/search", {
                params: {
                    name: searchVal
                }
            });
            setProducts(res.data);
            console.log(res.data);
        }
        catch (err) {
            console.log(err);
            showToast("Failed to load searched items", "error");
        }
    }

    const loadSuggestions = async (searchVal) =>{
        if(searchVal.length < 2){
            setSuggestions([]);
            return ;
        }
        try{
            const res = await api.get("/api/products/suggestions",{
                params: {
                    name: searchVal
                }
            })
            setSuggestions(res.data);
        }
        catch(err){
            console.log(err);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() =>{
            if (searchVal.trim() === "") {
                loadProducts();
            }
            else {
                searchProducts(searchVal);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchVal]);

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
            }
            else {
                showToast("Product added to cart successfully!", "success");
            }
        }
        catch (error) {
            console.log(error);
            showToast("Failed to add to cart", "error");
        }
    }

    const getAllAddresses = async () => {
        try {
            const res = await api.get("/api/profile/allAddresses");
            setAddress(res.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleAddToWishlist = async (productId) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        const existingItem = wishlist.find(w => w.productId === productId);
        if (existingItem) {
            try {
                await api.post("/api/wishlist/removeItem", {
                    wishlistItemId: existingItem.wishlistItemId
                });
                showToast("Removed from Wishlist", "info");
                const res = await api.get("/api/wishlist");
                setWishlist(res.data);
            } catch (err) {
                console.log(err);
            }
            return;
        }
        try {
            await api.post("/api/wishlist/add", { productId });
            showToast("Added to Wishlist", "success");
            const res = await api.get("/api/wishlist");
            setWishlist(res.data);
        }
        catch (error) {
            console.log(error);
            showToast("Failed to add to wishlist", "error");
        }
    }

    const isSearching = searchVal.trim() !== "";

    return (
        <div className={styles.homePage}>
            <Navbar searchVal={searchVal} setSearchVal={setSearchVal} loadSuggestions={loadSuggestions} suggestions={suggestions} setSuggestions={setSuggestions} />

            {/* Hero Section */}
            {!isSearching && (
                <section className={styles.hero}>
                    <div className={styles.heroSlider}>
                        <button className={styles.sliderArrow + ' ' + styles.sliderArrowLeft} onClick={prevSlide} aria-label="Previous slide">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <div className={styles.sliderTrack} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                            {heroSlides.map((slide, index) => (
                                <div className={styles.slide} key={index}>
                                    <img src={slide.url} alt={slide.alt} className={styles.slideImage} />
                                </div>
                            ))}
                        </div>
                        <button className={styles.sliderArrow + ' ' + styles.sliderArrowRight} onClick={nextSlide} aria-label="Next slide">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                        <div className={styles.sliderDots}>
                            {heroSlides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
                                    onClick={() => goToSlide(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Categories Section */}
            {!isSearching && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Shop by category</h2>
                    <div className={styles.categoryGrid}>
                        {categories.map(category => (
                            <Link
                                key={category.id}
                                to={`/products?category=${category.id}`}
                                className={styles.categoryCard}
                            >
                                <span className={styles.categoryIcon}>
                                    {getCategoryIcon(category.name)}
                                </span>
                                <span className={styles.categoryName}>{category.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Products Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    {isSearching ? `Search results for "${searchVal}"` : "Featured products"}
                </h2>
                {products.length === 0 ? (
                    <div className={styles.noProducts}>
                        <h3>No products found</h3>
                        <p>Try searching for something else or browse categories.</p>
                    </div>
                ) : (
                    <div className={styles.productsGrid}>
                        {products.map((product) => (
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

            {/* Promo Banner */}
            <section className={styles.promoBanner}>
                <div className={styles.promoInner}>
                    <div className={styles.promoText}>
                        <h3>🚚 Free delivery on orders above ₹999</h3>
                        <p>Pan-India shipping · 7-day returns · 1-year warranty</p>
                    </div>
                </div>
            </section>

            <ScrollButtons />
            <Footer />
        </div>
    );
}

export default Home;