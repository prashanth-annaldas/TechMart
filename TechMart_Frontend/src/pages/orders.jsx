import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import styles from "./Orders.module.css";
import ScrollButtons from "../components/ScrollButtons";
import { FiBox, FiShoppingBag, FiMapPin } from "react-icons/fi";

function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            const res = await api.get("/api/orders");
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to load orders:", error);
            if (error.response && error.response.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

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
            <div className={styles.ordersPage}>
                <Navbar searchVal="" setSearchVal={() => {}} />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid #ccc", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.ordersPage}>
            <Navbar searchVal="" setSearchVal={() => {}} />

            <main className={styles.content}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>
                        <FiBox size={24} style={{ marginRight: "10px", color: "var(--accent)", verticalAlign: "middle" }} /> My Orders
                    </h1>
                    <p className={styles.pageSubtitle}>Track your shipments and view past purchases</p>
                </div>

                {orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FiShoppingBag size={64} className={styles.emptyIcon} style={{ marginBottom: "16px" }} />
                        <h2 className={styles.emptyTitle}>No orders found</h2>
                        <p className={styles.emptyDesc}>Looks like you haven't bought anything yet.</p>
                        <Link to="/" className={styles.emptyLink}>Start Shopping</Link>
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
                                            <span className={styles.locationText}>
                                                <FiMapPin style={{ marginRight: "4px", verticalAlign: "middle" }} /> 
                                                Shipped to: {order.city}
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
}

export default Orders;