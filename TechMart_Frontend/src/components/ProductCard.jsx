import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";
import { FiHeart, FiPlus } from "react-icons/fi";

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
                        <FiHeart
                            size={18}
                            fill={isWishlisted ? "currentColor" : "none"}
                            style={{ display: "block" }}
                        />
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
                                    <FiPlus size={16} />
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
