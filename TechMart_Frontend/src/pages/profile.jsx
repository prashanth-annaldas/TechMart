import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import styles from "./Profile.module.css";
import ScrollButtons from "../components/ScrollButtons";

function Profile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile"); // profile | orders | addresses
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Address Form State
    const emptyForm = {
        fullName: "",
        phoneNumber: "",
        houseNo: "",
        street: "",
        landmark: "",
        city: "",
        state: "",
        country: "India",
        pincode: ""
    };
    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Check auth and load user
            const userRes = await api.get("/api/auth/me");
            setUser(userRes.data);
            console.log(userRes.data);

            // Fetch addresses
            const addrRes = await api.get("/api/profile/allAddresses");
            if (Array.isArray(addrRes.data)) {
                setAddresses(addrRes.data);
            }

            // Fetch orders
            const ordersRes = await api.get("/api/orders");
            if (Array.isArray(ordersRes.data)) {
                setOrders(ordersRes.data);
            }
        } catch (error) {
            console.error("Failed to load profile data:", error);
            if (error.response && error.response.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const loadAddresses = async () => {
        try {
            const res = await api.get("/api/profile/allAddresses");
            if (Array.isArray(res.data)) {
                setAddresses(res.data);
            }
        } catch (error) {
            console.error("Failed to load addresses:", error);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const addNewAddress = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
    };

    const editAddress = (address) => {
        setEditingId(address.id);
        setForm({
            fullName: address.fullName || "",
            phoneNumber: address.phoneNumber || "",
            houseNo: address.houseNo || "",
            street: address.street || "",
            landmark: address.landmark || "",
            city: address.city || "",
            state: address.state || "",
            country: address.country || "India",
            pincode: address.pincode || ""
        });
        setShowForm(true);
    };

    const saveAddress = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/api/profile/editAddress/${editingId}`, form);
                showToast("Address Updated successfully!", "success");
            } else {
                await api.post("/api/profile/address", form);
                showToast("Address Saved successfully!", "success");
            }
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(false);
            loadAddresses();
        } catch (error) {
            console.error("Operation Failed:", error);
            showToast("Operation Failed. Please check the fields.", "error");
        }
    };

    const deleteAddress = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this address?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/api/profile/deleteAddress/${id}`);
            showToast("Address Deleted", "success");
            loadAddresses();
        } catch (error) {
            console.error("Delete Failed:", error);
            showToast("Delete Failed", "error");
        }
    };

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").slice(0, 2);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PLACED": return styles.statusPlaced;
            case "PROCESSING": return styles.statusProcessing;
            case "SHIPPED": return styles.statusShipped;
            case "DELIVERED": return styles.statusDelivered;
            case "CANCELLED": return styles.statusCancelled;
            default: return styles.statusPlaced;
        }
    };

    if (loading) {
        return (
            <div className={styles.profilePage}>
                <Navbar searchVal="" setSearchVal={() => {}} />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid #ccc", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.profilePage}>
            <Navbar searchVal="" setSearchVal={() => {}} />

            <main className={styles.content}>
                <h1 className={styles.pageTitle}>My Account</h1>

                {/* Tab Navigation */}
                <div className={styles.tabNav}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "profile" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Profile Details
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "orders" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("orders")}
                    >
                        Order History
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "addresses" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("addresses")}
                    >
                        Address Book
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "Account" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("Account")}
                    >
                        Account
                    </button>
                </div>

                {/* Tab Panels */}
                {activeTab === "profile" && user && (
                    <div className={styles.panel}>
                        <div className={styles.profileCard}>
                            <div className={styles.avatar}>{getInitials(user.email)}</div>
                            <div className={styles.profileDetails}>
                                <span className={styles.profileName}>{user.name}</span>
                                <span className={styles.profileEmail}>{user.email}</span>
                                <span className={styles.profileRole}>
                                    {user.role === "ROLE_ADMIN" ? "Admin Account" : "Customer Account"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className={styles.panel}>
                        {orders.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>📦</span>
                                <h3 className={styles.emptyTitle}>You haven't placed any orders yet</h3>
                            </div>
                        ) : (
                            <div className={styles.ordersList}>
                                {orders.map((order, index) => (
                                    <div key={order.orderId || index} className={styles.orderCard}>
                                        <img
                                            src={order.imageUrl || "/placeholder.png"}
                                            alt={order.productName}
                                            className={styles.orderImage}
                                        />
                                        <div className={styles.orderInfo}>
                                            <div className={styles.orderMeta}>
                                                <h3 className={styles.productName}>{order.productName}</h3>
                                                <span className={styles.orderId}>Order ID: {order.orderId}</span>
                                            </div>
                                            <div className={styles.orderPriceQty}>
                                                <span className={styles.totalPrice}>₹{order.totalAmount?.toFixed(2)}</span>
                                                <span className={styles.qtyText}>Quantity: {order.quantity}</span>
                                            </div>
                                            <div className={styles.orderStatusLocation}>
                                                <span className={`${styles.statusBadge} ${getStatusStyle(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                {order.city && (
                                                    <span className={styles.locationText}>📍 Shipped to: {order.city}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "addresses" && (
                    <div className={styles.panel}>
                        <div className={styles.addressHeader}>
                            <h2 className={styles.sectionTitle}>Manage Shipping Addresses</h2>
                            {!showForm && (
                                <button className={styles.addBtn} onClick={addNewAddress}>
                                    + Add New Address
                                </button>
                            )}
                        </div>

                        {/* Address Form (Add/Edit) */}
                        {showForm && (
                            <form onSubmit={saveAddress} className={styles.addressForm}>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "8px" }}>
                                    {editingId ? "Edit Shipping Address" : "Add a new shipping address"}
                                </h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            placeholder="e.g. John Doe"
                                            value={form.fullName}
                                            onChange={handleChange}
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
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Flat, House no., Building *</label>
                                        <input
                                            type="text"
                                            name="houseNo"
                                            placeholder="House No"
                                            value={form.houseNo}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Area, Street, Sector *</label>
                                        <input
                                            type="text"
                                            name="street"
                                            placeholder="Street/Sector"
                                            value={form.street}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Landmark</label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            placeholder="Landmark"
                                            value={form.landmark}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="City"
                                            value={form.city}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            placeholder="State"
                                            value={form.state}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Country *</label>
                                        <input
                                            type="text"
                                            name="country"
                                            placeholder="Country"
                                            value={form.country}
                                            onChange={handleChange}
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
                                            onChange={handleChange}
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
                                    <button type="submit" className={styles.submitFormBtn}>
                                        {editingId ? "Update Address" : "Save Address"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Addresses Grid */}
                        {!showForm && (
                            addresses.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <span className={styles.emptyIcon}>🏠</span>
                                    <h3 className={styles.emptyTitle}>No shipping addresses saved</h3>
                                </div>
                            ) : (
                                <div className={styles.addressesGrid}>
                                    {addresses.map(address => (
                                        <div key={address.id} className={styles.addressCard}>
                                            <h3 className={styles.addressName}>{address.fullName}</h3>
                                            <p className={styles.addressDetail}>
                                                {address.houseNo}, {address.street}<br />
                                                {address.landmark && `Near ${address.landmark}, `}{address.city}<br />
                                                {address.state}, {address.country} - {address.pincode}
                                            </p>
                                            <span className={styles.addressPhone}>📞 {address.phoneNumber}</span>
                                            
                                            <div className={styles.addressActions}>
                                                <button className={styles.editBtn} onClick={() => editAddress(address)}>
                                                    Edit
                                                </button>
                                                <button className={styles.deleteBtn} onClick={() => deleteAddress(address.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                )}

                {activeTab === "Account" && (
                    <div className={styles.panel}>
                        <input type="text" />
                    </div>
                )}
            </main>

            <ScrollButtons />
            <Footer />
        </div>
    );
}

export default Profile;