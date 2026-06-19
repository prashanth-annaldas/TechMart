import { useEffect, useState } from "react";
import api from "../services/api";
import AddressSelector from "../components/addressSelector";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import styles from "./Cart.module.css";
import ScrollButtons from "../components/ScrollButtons";

function Cart(){

    const [cart, setCart] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const { showToast } = useToast();

    const loadCartItems = async () =>{
        try{
            const res = await api.get("/api/cart");
            setCart(res.data);
            console.log(res.data);
        }
        catch(err){
            console.log(err);
            showToast("Failed to load cart items", "error");
        }
    }

    useEffect(() =>{
        loadCartItems();
    }, []);

    const removeCartItem = async (cartItemId) =>{
        try{
            console.log("Removing:", cartItemId);
            const res = await api.post("/api/cart/removeCartItem", {cartItemId});
            showToast("Removed from cart", "info");
            loadCartItems();
        }
        catch(err){
            console.log(err);
            showToast("Failed to remove cart item", "error");
        }
    }

    const handleBuyNow = async (productId) =>{
        setSelectedProductId(productId);
        setShowAddressModal(true);
    }

    const placeOrder = async (productId, selectedAddressId) => {
        if (!selectedAddressId) {
            showToast("Please select an address", "warning");
            return;
        }

        try {

            await api.post("/api/orders/buyNow", {
                productId,
                quantity: 1,
                addressId: selectedAddressId
            });

            showToast("Order Placed Successfully", "success");

            setShowAddressModal(false);

        }
        catch (error) {
            console.log(error);
            showToast("Failed to place order", "error");
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const deliveryFee = subtotal > 999 ? 0 : 99;
    const total = subtotal + deliveryFee;

    return (
        <div className={styles.cartPage}>
            <Navbar searchVal="" setSearchVal={() => {}} />

            <div className={styles.cartContent}>
                <h1 className={styles.pageTitle}>
                    <span className={styles.titleIcon}>🛒</span>
                    Shopping Cart
                </h1>

                {cart.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>🛍️</span>
                        <h2 className={styles.emptyTitle}>Your cart is empty</h2>
                        <p className={styles.emptyDesc}>Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/" className={styles.emptyLink}>Continue Shopping</Link>
                    </div>
                ) : (
                    <div className={styles.cartLayout}>
                        <div className={styles.cartItems}>
                            {cart.map((item, index) => (
                                <div
                                    key={item.CartItemId}
                                    className={styles.cartItem}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <img
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        className={styles.cartItemImage}
                                    />
                                    <div className={styles.cartItemInfo}>
                                        <h3 className={styles.cartItemName}>{item.productName}</h3>
                                        <p className={styles.cartItemDesc}>{item.description}</p>
                                        <p className={styles.cartItemPrice}>₹{item.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <div className={styles.cartItemActions}>
                                        <button
                                            className={styles.btnRemove}
                                            onClick={() => removeCartItem(item.CartItemId)}
                                        >
                                            🗑️ Remove
                                        </button>
                                        <button
                                            className={styles.btnBuy}
                                            onClick={() => handleBuyNow(item.productId)}
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.cartSummary}>
                            <h3 className={styles.summaryTitle}>Order Summary</h3>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Subtotal ({cart.length} items)</span>
                                <span className={styles.summaryValue}>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Delivery</span>
                                {deliveryFee === 0 ? (
                                    <span className={styles.summaryFree}>FREE</span>
                                ) : (
                                    <span className={styles.summaryValue}>₹{deliveryFee}</span>
                                )}
                            </div>
                            <div className={styles.summaryDivider}></div>
                            <div className={styles.summaryTotal}>
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                            <Link to="/checkout" className={styles.checkoutBtn}>
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>

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

export default Cart;