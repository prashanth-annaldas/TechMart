import { useEffect, useState, useRef } from "react";
import Navbar from "../components/navbar";
import api from "../services/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AddressSelector from "../components/addressSelector";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useToast } from "../context/ToastContext";
import styles from "./Home.module.css";
import ScrollButtons from "../components/ScrollButtons";
import { 
    MdLaptopMac, 
    MdPhoneIphone, 
    MdHeadphones, 
    MdWatch, 
    MdTv, 
    MdPhotoCamera, 
    MdGamepad, 
    MdTablet, 
    MdShoppingBag,
    MdOutlineCheckroom,
    MdOutlineLight,
    MdChair,
    MdOutlineBook,
    MdOutlineBrush,
    MdSportsSoccer,
    MdAutoAwesome,
    MdGridOn
} from "react-icons/md";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { FiTruck, FiChevronDown } from "react-icons/fi";

const getFlipkartCategoryIcon = (name) => {
    const key = name.toLowerCase();
    if (key.includes("laptop")) return <MdLaptopMac />;
    if (key.includes("phone") || key.includes("mobile")) return <MdPhoneIphone />;
    if (key.includes("audio") || key.includes("headphone")) return <MdHeadphones />;
    if (key.includes("wearable") || key.includes("watch")) return <MdWatch />;
    if (key.includes("tv") || key.includes("appliance")) return <MdTv />;
    if (key.includes("camera")) return <MdPhotoCamera />;
    if (key.includes("accessory") || key.includes("game")) return <MdGamepad />;
    if (key.includes("tablet")) return <MdTablet />;
    if (key.includes("fashion") || key.includes("clothing")) return <MdOutlineCheckroom />;
    if (key.includes("home")) return <MdOutlineLight />;
    if (key.includes("furniture") || key.includes("chair")) return <MdChair />;
    if (key.includes("book")) return <MdOutlineBook />;
    if (key.includes("beauty") || key.includes("cosmetic")) return <MdOutlineBrush />;
    if (key.includes("sport")) return <MdSportsSoccer />;
    return <MdShoppingBag />;
};

const categoryIcons = {
    laptops: <MdLaptopMac />, phones: <MdPhoneIphone />, audio: <MdHeadphones />,
    wearables: <MdWatch />, tvs: <MdTv />, cameras: <MdPhotoCamera />,
    accessories: <MdGamepad />, tablets: <MdTablet />, default: <MdShoppingBag />
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
    const location = useLocation();
    const { showToast } = useToast();

    // Hero slider
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const catRowRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroSlides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    // Check scroll to show/hide arrows
    const handleScroll = () => {
        if (catRowRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = catRowRef.current;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
        }
    };

    // Trigger handleScroll once categories are loaded
    useEffect(() => {
        if (categories.length > 0) {
            setTimeout(handleScroll, 100);
        }
    }, [categories]);

    // Handle window resize to recheck arrows
    useEffect(() => {
        window.addEventListener("resize", handleScroll);
        return () => window.removeEventListener("resize", handleScroll);
    }, []);

    const slideLeft = () => {
        if (catRowRef.current) {
            catRowRef.current.scrollBy({ left: -260, behavior: "smooth" });
        }
    };

    const slideRight = () => {
        if (catRowRef.current) {
            catRowRef.current.scrollBy({ left: 260, behavior: "smooth" });
        }
    };

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
    
    // Flipkart visible limits: 8 visible including "For You" and "More"
    // Since we show "For You" first, we can show up to 8 visible categories from DB.
    const visibleCategories = categories.slice(0, 8);
    const remainingCategories = categories.slice(8);

    return (
        <div className={styles.homePage}>
            <Navbar searchVal={searchVal} setSearchVal={setSearchVal} loadSuggestions={loadSuggestions} suggestions={suggestions} setSuggestions={setSuggestions} />

            {/* Flipkart Category Bar */}
            {!isSearching && (
                <div className={styles.flipkartCatBar}>
                    <div className={styles.flipkartCatInnerWrapper}>
                        {showLeftArrow && (
                            <button 
                                className={`${styles.catSliderBtn} ${styles.catSliderBtnLeft}`}
                                onClick={slideLeft}
                                aria-label="Slide categories left"
                            >
                                <HiChevronLeft />
                            </button>
                        )}

                        <div 
                            ref={catRowRef}
                            className={styles.flipkartCatInner}
                            onScroll={handleScroll}
                        >

                            {categories.map(category => (
                                <Link
                                    key={category.id}
                                    to={`/products?category=${category.id}`}
                                    className={styles.flipkartCatCard}
                                >
                                    <div className={styles.flipkartCatIconWrap}>
                                        {getFlipkartCategoryIcon(category.name)}
                                    </div>
                                    <span className={styles.flipkartCatName}>{category.name}</span>
                                </Link>
                            ))}
                        </div>

                        {showRightArrow && (
                            <button 
                                className={`${styles.catSliderBtn} ${styles.catSliderBtnRight}`}
                                onClick={slideRight}
                                aria-label="Slide categories right"
                            >
                                <HiChevronRight />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Hero Section */}
            {!isSearching && (
                <section className={styles.hero}>
                    <div className={styles.heroSlider}>
                        <button className={styles.sliderArrow + ' ' + styles.sliderArrowLeft} onClick={prevSlide} aria-label="Previous slide">
                            <HiChevronLeft size={22} />
                        </button>
                        <div className={styles.sliderTrack} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                            {heroSlides.map((slide, index) => (
                                <div className={styles.slide} key={index}>
                                    <img src={slide.url} alt={slide.alt} className={styles.slideImage} />
                                </div>
                            ))}
                        </div>
                        <button className={styles.sliderArrow + ' ' + styles.sliderArrowRight} onClick={nextSlide} aria-label="Next slide">
                            <HiChevronRight size={22} />
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
                        <h3>
                            <FiTruck size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} /> 
                            Free delivery on orders above ₹999
                        </h3>
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