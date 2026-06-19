import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";

function ProductCard({ product, onAddToCart, onAddToWishlist, isWishlisted, showActions = true }) {
    const navigate = useNavigate();

    const handleCardClick = (e) => {
        // Prevent navigation if clicking on buttons
        if (e.target.closest("button")) return;
        navigate(`/products/${product.id}`);
    };

    return (
        <div className={styles.card} onClick={handleCardClick} style={{ cursor: "pointer" }}>
            <div className={styles.imageArea}>
                <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className={styles.image}
                    loading="lazy"
                />
                {showActions && (
                    <button
                        className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onAddToWishlist) onAddToWishlist(product.id);
                        }}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill={isWishlisted ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ display: "block" }}
                        >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                    </button>
                )}
            </div>

            <div className={styles.content}>
                {(product.categoryName || product.category?.name) && (
                    <span className={styles.category}>{product.categoryName || product.category.name}</span>
                )}
                <h3 className={styles.title}>{product.name}</h3>
                <p className={styles.description}>{product.description}</p>
                <p>Rating: {product.averageRating ? product.averageRating : "No rating"} / {product.reviewCount}</p>

                <div className={styles.footerRow}>
                    <div className={styles.price}>
                        ₹<span className={styles.priceAccent}>{product.price?.toFixed(2)}</span>
                    </div>

                    {showActions && (
                        <div className={styles.actions}>
                            {onAddToCart && (
                                <button
                                    className={styles.addToCartBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCart(product.id);
                                    }}
                                    title="Add to Cart"
                                >
                                    +
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
