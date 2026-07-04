import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import styles from "./AdminOrders.module.css";
import ScrollButtons from "../components/ScrollButtons";
import { FiMapPin } from "react-icons/fi";

const AdminOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        checkAdminAuth();
    }, []);

    const checkAdminAuth = async () => {
        try {
            const res = await api.get("/api/auth/me");
            if (res.data.role !== "ROLE_ADMIN") {
                showToast("Access Denied: Admins Only", "error");
                navigate("/");
            } else {
                loadOrders();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const res = await api.get("/api/admin/orders");
            setOrders(res.data);
        }
        catch (error) {
            console.error("Failed to load admin orders:", error);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.put(`/api/admin/orders/${orderId}/status`, { status });
            showToast("Order Status Updated successfully!", "success");
            loadOrders();
        }
        catch (error) {
            console.error("Failed to update status:", error);
            showToast("Failed to update status", "error");
        }
    };

    if (loading) {
        return (
            <div className={styles.adminPage}>
                <Navbar searchVal="" setSearchVal={() => {}} />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                    <div style={{ width: "40px", height: "40px", border: "2px solid #ccc", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.adminPage}>
            <Navbar searchVal="" setSearchVal={() => {}} />

            <main className={styles.content}>
                <h1 className={styles.pageTitle}>Order Management</h1>

                {orders.length === 0 ? (
                    <p className={styles.emptyText}>No customer orders have been placed yet.</p>
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
                                        <span className={styles.customerEmail}>Customer email: {order.customerEmail}</span>
                                    </div>
                                    
                                    <div className={styles.orderPriceQty}>
                                        <span className={styles.totalPrice}>₹{order.totalAmount?.toFixed(2)}</span>
                                        <span className={styles.qtyText}>Quantity: {order.quantity}</span>
                                    </div>
                                    
                                    <div className={styles.orderStatusActions}>
                                        <span className={styles.statusLabel}>Change Status</span>
                                        <select
                                            className={styles.statusSelect}
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                                        >
                                            <option value="PLACED">PLACED</option>
                                            <option value="PROCESSING">PROCESSING</option>
                                            <option value="SHIPPED">SHIPPED</option>
                                            <option value="DELIVERED">DELIVERED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
                                        {order.city && (
                                            <span className={styles.locationText}>
                                                <FiMapPin style={{ marginRight: "4px", verticalAlign: "middle" }} /> 
                                                Destination: {order.city}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <ScrollButtons />
            <Footer />
        </div>
    );
};

export default AdminOrders;