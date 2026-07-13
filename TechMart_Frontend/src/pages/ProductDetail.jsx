import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import AddressSelector from "../components/addressSelector";
import { useToast } from "../context/ToastContext";
import styles from "./ProductDetail.module.css";
import ScrollButtons from "../components/ScrollButtons";
import { FiShoppingCart, FiHeart } from "react-icons/fi";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviews, setReviews] = useState([]);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [code, setCode] = useState("");
    
    // Address Modal (Buy Now)
    const [showAddressModal, setShowAddressModal] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        checkAuthAndLoadWishlist();
        fetchProduct();
        loadReviews(id);
    }, [id]);

    const handleReviews = async (productId) =>{
        try{
            const res = await api.post("/api/reviews/add",{
                rating,
                comment,
                productId
            })

            console.log(res.data);

            alert("Review added successfully");

            setRating(5);
            setComment("");
            await loadReviews(productId);
        }
        catch(err){
            console.log(err);
            alert("Failed to add reviews");
        }
    }

    const loadReviews = async (productId) =>{
        try{
            const res = await api.get(`/api/products/reviews/${productId}`);
            
            setReviews(res.data);
        }
        catch(err){
            console.log(err);
            alert("Failed to load reviews");
        }
    }

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

    const fetchProduct = async () => {
        setLoading(true);
        setErrorMsg("");

        try {
            const res = await api.get(`/api/products/${id}`);

            setProduct(res.data);

        } catch (error) {
            console.error("Error fetching product:", error);

            if (error.response?.status === 404) {
                setErrorMsg("Product not found");
            } else {
                setErrorMsg("Failed to load product details");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleQtyChange = (amount) => {
        setQuantity(prev => {
            const nextQty = prev + amount;
            if (nextQty < 1) return 1;
            if (product && nextQty > product.stock) return product.stock;
            return nextQty;
        });
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        try {
            const res = await api.post("/api/cart/addToCart", {
                productId: product.id,
                quantity: quantity
            });
            if (res.data === "ALREADY EXISTS") {
                showToast("This product is already in your cart.", "warning");
            } else {
                showToast(`${quantity} item(s) added to cart successfully!`, "success");
            }
        } catch (error) {
            console.error("Add to cart failed:", error);
            showToast("Failed to add to cart.", "error");
        }
    };

    const handleAddToWishlist = async () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const existingItem = wishlist.find(item => item.productId === product.id);
        if (existingItem) {
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
            await api.post("/api/wishlist/add", { productId: product.id });
            showToast("Added to Wishlist", "success");
            // Reload wishlist
            const wishlistRes = await api.get("/api/wishlist");
            setWishlist(wishlistRes.data);
        } catch (error) {
            console.error("Failed to add to wishlist:", error);
            showToast("Failed to add to wishlist.", "error");
        }
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        setShowAddressModal(true);
    };

    const placeOrder = async (productId, selectedAddressId, code, quantity) => {
        if (!selectedAddressId) {
            showToast("Please select an address", "warning");
            return;
        }

        try {
            const orderRes = await api.post("/api/payment/buy-now/create-order", {
                productId,
                quantity,
                code,
            });

            if (!window.Razorpay) {
                showToast("Razorpay SDK not loaded", "error");
                return;
            }

            const options = {
                key: "rzp_test_T1oFmHoHcfM7ww",
                amount: orderRes.data.amount,
                currency: orderRes.data.currency,
                order_id: orderRes.data.razorpayOrderId,
                name: "TechMart",
                description: "Product purchase",

                handler: async function(response){
                    try {

                        await api.post(
                            "/api/payment/buy-now/verify",
                            {
                                productId,
                                quantity,
                                addressId: selectedAddressId,
                                couponCode: code,

                                razorpayOrderId:
                                    response.razorpay_order_id,

                                razorpayPaymentId:
                                    response.razorpay_payment_id,

                                razorpaySignature:
                                    response.razorpay_signature
                            }
                        );

                        showToast(
                            "Payment Successful!",
                            "success"
                        );

                        navigate("/orders");

                    } catch (err) {

                        console.error(err);

                        showToast(
                            "Payment verification failed    ",
                            "error"
                        );
                    }
                },

                modal: {
                    ondismiss: function () {
                        showToast(
                            "Payment Cancelled",
                            "warning"
                        );
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.open();

        } catch (error) {

            console.error(error);

            showToast(
                "Unable to initiate payment",
                "error"
            );
        }
    }

    const isWishlisted = wishlist.some(item => item.productId === product?.id);

    if (loading) {
        return (
            <div className={styles.detailPage}>
                <Navbar searchVal="" setSearchVal={() => {}} suggestions="" setSuggestions={() => {}} />
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading product details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (errorMsg || !product) {
        return (
            <div className={styles.detailPage}>
                <Navbar searchVal="" setSearchVal={() => {}} suggestions="" setSuggestions={() => {}} />
                <div className={styles.errorContainer}>
                    <h2 className={styles.errorTitle}>Error</h2>
                    <p className={styles.errorDesc}>{errorMsg || "Something went wrong"}</p>
                    <button className={styles.backBtn} onClick={() => navigate("/products")}>
                        Back to Products
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const isInStock = product.stock > 0;

    return (
        <div className={styles.detailPage}>
            <Navbar searchVal="" setSearchVal={() => {}} suggestions="" setSuggestions={() => {}} />

            <main className={styles.content}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <div className={styles.layout}>
                    {/* Image Column */}
                    <div className={styles.imageSection}>
                        <img
                            src={product.imageUrl || "/placeholder.png"}
                            alt={product.name}
                            className={styles.productImg}
                        />
                    </div>

                    {/* Information Column */}
                    <div className={styles.infoSection}>
                        {product.category && (
                            <span className={styles.categoryTag}>{product.category.name}</span>
                        )}
                        <h1 className={styles.title}>{product.name}</h1>

                        <div className={styles.badgeRow}>
                            <span className={`${styles.stockBadge} ${isInStock ? styles.inStock : styles.outOfStock}`}>
                                {isInStock ? "● In Stock" : "● Out of Stock"}
                            </span>
                        </div>

                        <div className={styles.price}>
                            <span className={styles.priceSymbol}>₹</span>
                            {product.price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        <div className={styles.descriptionSection}>
                            <h3 className={styles.sectionHeading}>Description</h3>
                            <p className={styles.descriptionText}>{product.description}</p>
                        </div>

                        {/* Quantity and Actions */}
                        {!isAdmin && (
                            <div className={styles.purchaseSection}>
                                {isInStock && (
                                    <div className={styles.qtyRow}>
                                        <span className={styles.qtyLabel}>Quantity:</span>
                                        <div className={styles.qtySelector}>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => handleQtyChange(-1)}
                                                disabled={quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className={styles.qtyValue}>{quantity}</span>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => handleQtyChange(1)}
                                                disabled={quantity >= product.stock}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className={styles.qtyMessage}>
                                            {product.stock} items left
                                        </span>
                                    </div>
                                )}

                                <div className={styles.actionsRow}>
                                    <button
                                        className={styles.addToCartBtn}
                                        onClick={handleAddToCart}
                                        disabled={!isInStock}
                                    >
                                        <FiShoppingCart size={16} style={{ marginRight: "8px" }} /> Add to Cart
                                    </button>
                                    <button
                                        className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ""}`}
                                        onClick={handleAddToWishlist}
                                    >
                                        {isWishlisted ? (
                                            <>
                                                <FiHeart size={16} fill="#ef4444" style={{ marginRight: "8px", color: "#ef4444", verticalAlign: "middle" }} /> Wishlisted
                                            </>
                                        ) : (
                                            <>
                                                <FiHeart size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Wishlist
                                            </>
                                        )}
                                    </button>
                                </div>

                                {isInStock && (
                                    <button className={styles.buyNowBtn} onClick={handleBuyNow}>
                                        Buy Now
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Ratings & Reviews Section (Flipkart-style, full-width) ── */}
                <div className={styles.reviewsBlock}>
                    <div className={styles.reviewsBlockHeader}>
                        <h2 className={styles.reviewsBlockTitle}>Ratings & Reviews</h2>
                        <span className={styles.reviewCount}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                    </div>

                    <div className={styles.reviewsLayout}>
                        {/* Left: Rating Summary */}
                        <div className={styles.ratingSummary}>
                            <div className={styles.ratingBig}>
                                <span className={styles.ratingNumber}>
                                    {reviews.length > 0
                                        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                                        : "–"}
                                </span>
                                <span className={styles.ratingOutOf}>/ 5</span>
                            </div>
                            <div className={styles.ratingStarsBig}>
                                {"★".repeat(Math.round(reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0))}
                                {"☆".repeat(5 - Math.round(reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0))}
                            </div>
                            <p className={styles.ratingBasedOn}>Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>

                            {/* Rating distribution bars */}
                            <div className={styles.ratingBars}>
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = reviews.filter(r => r.rating === star).length;
                                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                    return (
                                        <div key={star} className={styles.ratingBarRow}>
                                            <span className={styles.ratingBarLabel}>{star} ★</span>
                                            <div className={styles.ratingBarTrack}>
                                                <div
                                                    className={styles.ratingBarFill}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className={styles.ratingBarCount}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: Write a Review */}
                        {!isAdmin && (
                            <div className={styles.writeReview}>
                                <h3 className={styles.reviewSectionTitle}>✍️ Write a Review</h3>
                                <div className={styles.reviewForm}>
                                    <div className={styles.ratingRow}>
                                        <span className={styles.ratingLabel}>Your Rating:</span>
                                        <div className={styles.starRating}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`${styles.star} ${star <= rating ? styles.starFilled : ""}`}
                                                    onClick={() => setRating(star)}
                                                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        className={styles.reviewTextarea}
                                        value={comment}
                                        placeholder="Share your experience with this product..."
                                        onChange={(e) => setComment(e.target.value)}
                                        rows="4"
                                    />
                                    <button
                                        className={styles.submitReviewBtn}
                                        onClick={() => handleReviews(product.id)}
                                    >
                                        📝 Submit Review
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Customer Reviews List */}
                    <div className={styles.reviewsListSection}>
                        <h3 className={styles.reviewSectionTitle}>💬 Customer Reviews</h3>
                        {reviews.length === 0 ? (
                            <p className={styles.noReviews}>No reviews yet. Be the first to review this product!</p>
                        ) : (
                            <>
                                <div className={styles.reviewsList}>
                                    {(showAllReviews ? reviews : reviews.slice(0, 3)).map(review => (
                                        <div key={review.id} className={styles.reviewCard}>
                                            <div className={styles.reviewHeader}>
                                                <div className={styles.reviewAvatar}>
                                                    {review.userName ? review.userName.charAt(0) : "U"}
                                                </div>
                                                <div className={styles.reviewMeta}>
                                                    <span className={styles.reviewUser}>{review.userName}</span>
                                                    <span className={`${styles.reviewRatingBadge} ${
                                                        review.rating >= 4 ? styles.ratingGreen :
                                                        review.rating === 3 ? styles.ratingAmber :
                                                        styles.ratingRed
                                                    }`}>
                                                        {review.rating} ★
                                                    </span>
                                                </div>
                                            </div>
                                            <p className={styles.reviewComment}>{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                                {reviews.length > 3 && (
                                    <button
                                        className={styles.showMoreBtn}
                                        onClick={() => setShowAllReviews(prev => !prev)}
                                    >
                                        {showAllReviews
                                            ? `Show Less ▲`
                                            : `Show All ${reviews.length} Reviews ▼`}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {showAddressModal && (
                <AddressSelector
                    productId={product.id}
                    onClose={() => setShowAddressModal(false)}
                    code={code}
                    quantity={quantity}
                    onPlaceOrder={placeOrder}
                />
            )}

            <ScrollButtons />
            <Footer />
        </div>
    );
}

export default ProductDetail;
