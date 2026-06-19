import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import AddressSelector from "../components/addressSelector";
import { useToast } from "../context/ToastContext";
import styles from "./Wishlist.module.css";
import ScrollButtons from "../components/ScrollButtons";

function Wishlist() {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const { showToast } = useToast();

    const loadWishlist = async () => {
        try {
            const res = await api.get("/api/wishlist");
            setWishlist(res.data);
        } catch (error) {
            console.error("Failed to load wishlist:", error);
            // If 401, redirect to login
            if (error.response && error.response.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWishlist();
    }, []);

    const handleBuyNow = async (productId) => {
        setSelectedProductId(productId);
        setShowAddressModal(true);
    };

    const placeOrder = async (productId, selectedAddressId, quantity) => {
        if (!selectedAddressId) {
            showToast("Please select an address", "warning");
            return;
        }

        try {
            await api.post("/api/orders/buyNow", {
                productId,
                quantity: quantity,
                addressId: selectedAddressId
            });

            showToast("Order Placed Successfully!", "success");
            setShowAddressModal(false);
            navigate("/orders");
        } catch (error) {
            console.error("Failed to place order:", error);
            showToast("Failed to place order", "error");
        }
    };

    const handleRemoveItem = async (wishlistItemId) => {
        try {
            await api.post("/api/wishlist/removeItem", { wishlistItemId });
            showToast("Removed from wishlist", "info");
            loadWishlist();
        } catch (error) {
            console.error("Failed to remove item:", error);
            showToast("Failed to remove item from wishlist", "error");
        }
    };

    const handleRemoveByProductId = async (productId) => {
        const item = wishlist.find(w => w.productId === productId);
        if (item) {
            await handleRemoveItem(item.wishlistItemId);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            const res = await api.post("/api/cart/addToCart", {
                productId,
                quantity: 1
            });
            if (res.data === "ALREADY EXISTS") {
                showToast("This product is already in your cart.", "warning");
            } else {
                showToast("Product added to cart successfully!", "success");
                // Optionally remove from wishlist after adding to cart
                const item = wishlist.find(w => w.productId === productId);
                if (item) {
                    await handleRemoveItem(item.wishlistItemId);
                }
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            showToast("Failed to add to cart", "error");
        }
    };

    if (loading) {
        return (
            <div className={styles.wishlistPage}>
                <Navbar searchVal="" setSearchVal={() => {}} />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid #ccc", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.wishlistPage}>
            <Navbar searchVal="" setSearchVal={() => {}} />

            <main className={styles.content}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>
                        <span>❤️</span> My Wishlist
                    </h1>
                    <p className={styles.pageSubtitle}>Keep track of products you love and want to purchase later</p>
                </div>

                {wishlist.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>💝</span>
                        <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
                        <p className={styles.emptyDesc}>Save items that you like to view or purchase them later.</p>
                        <Link to="/" className={styles.emptyLink}>Explore Products</Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {wishlist.map(item => {
                            // Map wishlist item shape to product shape expected by ProductCard
                            const mappedProduct = {
                                id: item.productId,
                                name: item.productName,
                                description: item.description,
                                price: item.price,
                                imageUrl: item.imageUrl,
                                stock: 10 // Mock a positive stock count so it lets them buy/add
                            };
                            return (
                                <ProductCard
                                    key={item.wishlistItemId}
                                    product={mappedProduct}
                                    onAddToCart={handleAddToCart}
                                    onAddToWishlist={handleRemoveByProductId}
                                    onBuyNow={handleBuyNow}
                                    isWishlisted={true}
                                />
                            );
                        })}
                    </div>
                )}
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

export default Wishlist;