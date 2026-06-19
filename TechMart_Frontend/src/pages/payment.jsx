import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import ScrollButtons from "../components/ScrollButtons";
import { useToast } from "../context/ToastContext";
import styles from "./Payment.module.css";

const Payment = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const loadPayments = async () => {
        try {
            const res = await api.get("/api/payment/history");
            setPayments(res.data);
            console.log(res.data);
        } catch (err) {
            console.error("Failed to load payments:", err);
            showToast("Failed to load payment history", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    const getStatusClass = (status) => {
        if (!status) return styles.statusDefault;
        const s = status.toUpperCase();
        if (s === "CAPTURED" || s === "SUCCESS" || s === "PAID") return styles.statusSuccess;
        if (s === "PENDING" || s === "CREATED") return styles.statusPending;
        if (s === "FAILED" || s === "CANCELLED" || s === "REFUNDED") return styles.statusFailed;
        return styles.statusDefault;
    };

    const getOrderStatusClass = (status) => {
        if (!status) return styles.statusDefault;
        const s = status.toUpperCase();
        if (s === "DELIVERED") return styles.statusSuccess;
        if (s === "SHIPPED" || s === "PROCESSING" || s === "PLACED") return styles.statusPending;
        if (s === "CANCELLED") return styles.statusFailed;
        return styles.statusDefault;
    };

    if (loading) {
        return (
            <div className={styles.paymentPage}>
                <Navbar searchVal="" setSearchVal={() => {}} />
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading payment history...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.paymentPage}>
            <Navbar searchVal="" setSearchVal={() => {}} />

            <main className={styles.content}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>
                        <span>💳</span> Payment History
                    </h1>
                    <p className={styles.pageSubtitle}>View all your past transactions and payment details</p>
                </div>

                {payments.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>💸</span>
                        <h2 className={styles.emptyTitle}>No payments yet</h2>
                        <p className={styles.emptyDesc}>Once you make a purchase, your payment history will appear here.</p>
                        <Link to="/" className={styles.emptyLink}>Start Shopping</Link>
                    </div>
                ) : (
                    <div className={styles.paymentList}>
                        {payments.map(payment => (
                            <div key={payment.paymentId} className={styles.paymentCard}>
                                <img
                                    src={payment.imageUrl || "/placeholder.png"}
                                    alt={payment.productName}
                                    className={styles.paymentImage}
                                />

                                <div className={styles.paymentInfo}>
                                    <h3 className={styles.productName}>{payment.productName}</h3>

                                    <div className={styles.paymentMeta}>
                                        <span className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Payment:</span>
                                            <span className={`${styles.statusBadge} ${getStatusClass(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </span>

                                        <span className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Order:</span>
                                            <span className={`${styles.statusBadge} ${getOrderStatusClass(payment.orderStatus)}`}>
                                                {payment.orderStatus}
                                            </span>
                                        </span>

                                        <span className={styles.metaItem}>
                                            <span className={styles.metaLabel}>Date:</span>
                                            <span className={styles.metaValue}>
                                                {new Date(payment.paymentTime).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.amountBadge}>
                                    <span className={styles.amountSymbol}>₹</span>
                                    {(payment.amount / 100).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
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

export default Payment;