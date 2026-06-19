import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import styles from "./Checkout.module.css";
import ScrollButtons from "../components/ScrollButtons";

function Checkout() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const { showToast } = useToast();

    // New Address Form State
    const [form, setForm] = useState({
        fullName: "",
        phoneNumber: "",
        houseNo: "",
        street: "",
        landmark: "",
        city: "",
        state: "",
        country: "India",
        pincode: ""
    });

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);

    const checkAuthAndLoadData = async () => {
        try {
            // Check auth
            const userRes = await api.get("/api/auth/me");
            if (!userRes.data || !userRes.data.role) {
                navigate("/login");
                return;
            }

            // Load Cart
            const cartRes = await api.get("/api/cart");
            setCart(cartRes.data);

            if (cartRes.data.length === 0) {
                showToast("Your cart is empty! Redirecting to home.", "warning");
                navigate("/");
                return;
            }

            // Load Addresses
            loadAddresses();
        } catch (err) {
            console.error("Auth check failed:", err);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const loadAddresses = async () => {
        try {
            const res = await api.get("/api/profile/allAddresses");
            setAddresses(res.data);
            if (res.data.length > 0) {
                setSelectedAddressId(res.data[0].id);
            }
        } catch (error) {
            console.error("Failed to load addresses:", error);
        }
    };

    const handleFormChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        // Validation
        if (!form.fullName || !form.phoneNumber || !form.houseNo || !form.street || !form.city || !form.state || !form.pincode) {
            showToast("Please fill in all required fields.", "warning");
            return;
        }

        try {
            const res = await api.post("/api/profile/address", form);
            showToast("Address saved successfully!", "success");
            setShowForm(false);
            setForm({
                fullName: "",
                phoneNumber: "",
                houseNo: "",
                street: "",
                landmark: "",
                city: "",
                state: "",
                country: "India",
                pincode: ""
            });
            // Reload addresses and select the new one if possible
            await loadAddresses();
        } catch (error) {
            console.error("Failed to save address:", error);
            showToast("Failed to save address", "error");
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            showToast("Please select a delivery address.", "warning");
            return;
        }

        setPlacingOrder(true);
        try {
            // Since there is no bulk order API, place orders sequentially for each item in the cart,
            // then clear the item from the cart.
            for (const item of cart) {
                await api.post("/api/orders/buyNow", {
                    productId: item.productId,
                    quantity: 1, // checkout is typically 1 per item added, or we can use item.quantity if cart item tracks it
                    addressId: selectedAddressId
                });
                
                // Clear this item from cart
                await api.post("/api/cart/removeCartItem", {
                    cartItemId: item.CartItemId
                });
            }

            showToast("Order placed successfully! Thank you for shopping with TechMart.", "success");
            navigate("/orders");
        } catch (error) {
            console.error("Order placement failed:", error);
            showToast("An error occurred while placing your order. Please try again.", "error");
        } finally {
            setPlacingOrder(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const deliveryFee = subtotal > 999 ? 0 : 99;
    const total = subtotal + deliveryFee;

    if (loading) {
        return (
            <div className={styles.checkoutPage}>
                <Navbar searchVal="" setSearchVal={() => {}} />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid #ccc", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.checkoutPage}>
            <Navbar searchVal="" setSearchVal={() => {}} />

            <main className={styles.content}>
                <h1 className={styles.pageTitle}>
                    <span>💳</span> Checkout
                </h1>

                <div className={styles.layout}>
                    {/* Left: Address Selector / Addition */}
                    <div className={styles.checkoutCard}>
                        <div className={styles.stepSection}>
                            <div className={styles.stepHeader}>
                                <div className={styles.stepNumber}>1</div>
                                <h2 className={styles.stepTitle}>Delivery Address</h2>
                            </div>

                            {/* Addresses List */}
                            {!showForm && (
                                <>
                                    <div className={styles.addressesGrid}>
                                        {addresses.map(address => (
                                            <div
                                                key={address.id}
                                                className={`${styles.addressCard} ${selectedAddressId === address.id ? styles.addressCardSelected : ""}`}
                                                onClick={() => setSelectedAddressId(address.id)}
                                            >
                                                <input
                                                    type="radio"
                                                    name="selectedAddress"
                                                    className={styles.radioInput}
                                                    checked={selectedAddressId === address.id}
                                                    onChange={() => setSelectedAddressId(address.id)}
                                                />
                                                <div className={styles.addressDetails}>
                                                    <span className={styles.fullName}>{address.fullName}</span>
                                                    <span>{address.houseNo}, {address.street}</span>
                                                    {address.landmark && <span>Near {address.landmark}</span>}
                                                    <span>{address.city}, {address.state} - {address.pincode}</span>
                                                    <span className={styles.phone}>📞 {address.phoneNumber}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className={styles.addNewAddressBtn}
                                        onClick={() => setShowForm(true)}
                                    >
                                        + Add New Address
                                    </button>
                                </>
                            )}

                            {/* Add Address Form */}
                            {showForm && (
                                <form onSubmit={handleSaveAddress} className={styles.addressForm}>
                                    <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>Add a new shipping address</h3>
                                    
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Full Name *</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                placeholder="John Doe"
                                                value={form.fullName}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Phone Number *</label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                placeholder="10-digit mobile number"
                                                value={form.phoneNumber}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Flat, House no., Building *</label>
                                            <input
                                                type="text"
                                                name="houseNo"
                                                placeholder="e.g. Flat 101, block A"
                                                value={form.houseNo}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Area, Street, Sector *</label>
                                            <input
                                                type="text"
                                                name="street"
                                                placeholder="e.g. Green Avenue, Sector 4"
                                                value={form.street}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Landmark (Optional)</label>
                                            <input
                                                type="text"
                                                name="landmark"
                                                placeholder="e.g. near Apollo Hospital"
                                                value={form.landmark}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Town/City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                placeholder="Mumbai"
                                                value={form.city}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>State *</label>
                                            <input
                                                type="text"
                                                name="state"
                                                placeholder="Maharashtra"
                                                value={form.state}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Pincode *</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                placeholder="6-digit pincode"
                                                value={form.pincode}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formActions}>
                                        <button
                                            type="button"
                                            className={styles.cancelFormBtn}
                                            onClick={() => setShowForm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className={styles.saveAddressBtn}>
                                            Save Address
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Right: Order Summary Sidebar */}
                    <div className={styles.summaryPanel}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>
                        
                        <div className={styles.orderItems}>
                            {cart.map(item => (
                                <div key={item.CartItemId} className={styles.orderItem}>
                                    <img
                                        src={item.imageUrl || "/placeholder.png"}
                                        alt={item.productName}
                                        className={styles.itemImage}
                                    />
                                    <div className={styles.itemDetails}>
                                        <h4 className={styles.itemName}>{item.productName}</h4>
                                        <span className={styles.itemQtyPrice}>Qty: 1 · ₹{item.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.summaryRow}>
                            <span>Subtotal ({cart.length} items)</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery Fee</span>
                            {deliveryFee === 0 ? (
                                <span style={{ color: "var(--success)", fontWeight: "600" }}>FREE</span>
                            ) : (
                                <span>₹{deliveryFee.toFixed(2)}</span>
                            )}
                        </div>
                        
                        <div className={styles.summaryDivider}></div>

                        <div className={styles.summaryTotal}>
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>

                        <button
                            className={styles.placeOrderBtn}
                            onClick={handlePlaceOrder}
                            disabled={placingOrder || !selectedAddressId}
                        >
                            {placingOrder ? "Placing Order..." : "Confirm & Place Order"}
                        </button>
                    </div>
                </div>
            </main>

            <ScrollButtons />
            <Footer />
        </div>
    );
}

export default Checkout;
