import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import styles from "./Coupon.module.css";
import ScrollButtons from "../components/ScrollButtons";

const Coupon = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);

    const [coupon, setCoupon] = useState({
        code: "",
        description: "",
        discountType: "FIXED",
        discount: "",
        minOrderAmount: "",
        maxDiscount: "",
        startDate: "",
        endDate: "",
        usageLimit: ""
    });

    const [coupons, setCoupons] = useState([]);

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
                loadCoupons();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setCoupon({
            ...coupon,
            [e.target.name]: e.target.value
        });
    };
    
    const createCoupon = async (e) => {
        e.preventDefault();

        // Validations
        if (!coupon.code || !coupon.description || !coupon.discount) {
            showToast("Please fill in all required fields.", "warning");
            return;
        }

        try {
            const response = await api.post("/api/admin/create-coupon", coupon);
            showToast("Coupon Created Successfully!", "success");
            
            // Reset form
            setCoupon({
                code: "",
                description: "",
                discountType: "FIXED",
                discount: "",
                minOrderAmount: "",
                maxDiscount: "",
                startDate: "",
                endDate: "",
                usageLimit: ""
            });
            
            // Refresh list
            loadCoupons();
        } catch (err) {
            console.error("Failed to create coupon:", err);
            showToast(err.response?.data || "Failed to create coupon", "error");
        }
    };

    const loadCoupons = async () => {
        try {
            const res = await api.get("/api/admin/coupons");
            setCoupons(res.data || []);
        } catch (err) {
            console.error("Failed to load coupons:", err);
            showToast("Failed to load existing coupons", "error");
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
                <h1 className={styles.pageTitle}>Coupon Management</h1>

                <div className={styles.layout}>
                    {/* Left: Create Coupon Form */}
                    <div className={styles.formCard}>
                        <h2 className={styles.sectionTitle}>Create New Coupon</h2>
                        <form onSubmit={createCoupon}>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Coupon Code *</label>
                                <input
                                    type="text"
                                    name="code"
                                    placeholder="e.g. TECHMART30"
                                    className={styles.input}
                                    value={coupon.code}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup} style={{ marginTop: "12px" }}>
                                <label className={styles.label}>Description *</label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="e.g. Get 30% off on electronics"
                                    className={styles.input}
                                    value={coupon.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formRow} style={{ marginTop: "12px" }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Discount Type</label>
                                    <select
                                        name="discountType"
                                        className={styles.select}
                                        value={coupon.discountType}
                                        onChange={handleChange}
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Discount Value *</label>
                                    <input
                                        type="number"
                                        name="discount"
                                        placeholder="Discount"
                                        className={styles.input}
                                        value={coupon.discount}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow} style={{ marginTop: "12px" }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Min Order (₹)</label>
                                    <input
                                        type="number"
                                        name="minOrderAmount"
                                        placeholder="Min Order Amount"
                                        className={styles.input}
                                        value={coupon.minOrderAmount}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Max Discount (₹)</label>
                                    <input
                                        type="number"
                                        name="maxDiscount"
                                        placeholder="Max Discount"
                                        className={styles.input}
                                        value={coupon.maxDiscount}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow} style={{ marginTop: "12px" }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        className={styles.input}
                                        value={coupon.startDate}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        className={styles.input}
                                        value={coupon.endDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup} style={{ marginTop: "12px" }}>
                                <label className={styles.label}>Usage Limit</label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    placeholder="Total usage limit"
                                    className={styles.input}
                                    value={coupon.usageLimit}
                                    onChange={handleChange}
                                    min="1"
                                />
                            </div>

                            <button type="submit" className={styles.submitBtn}>
                                Create Coupon
                            </button>
                        </form>
                    </div>

                    {/* Right: Existing Coupons Grid */}
                    <div className={styles.listCard}>
                        <h2 className={styles.sectionTitle}>Existing Coupons</h2>
                        {coupons.length === 0 ? (
                            <p className={styles.emptyText}>No coupons created yet.</p>
                        ) : (
                            <div className={styles.couponGrid}>
                                {coupons.map((c) => (
                                    <div key={c.id || c._id} className={styles.couponItem}>
                                        <div className={styles.couponHeader}>
                                            <span className={styles.couponCode}>{c.code}</span>
                                            <span className={styles.discountBadge}>
                                                {c.discountType === "PERCENTAGE" ? `${c.discount}% Off` : `₹${c.discount} Off`}
                                            </span>
                                        </div>
                                        <p className={styles.couponDesc}>{c.description}</p>
                                        
                                        <div className={styles.couponDetails}>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Min Spend:</span>
                                                <span className={styles.detailValue}>₹{c.minOrderAmount || 0}</span>
                                            </div>
                                            {c.discountType === "PERCENTAGE" && c.maxDiscount && (
                                                <div className={styles.detailItem}>
                                                    <span className={styles.detailLabel}>Max Disc:</span>
                                                    <span className={styles.detailValue}>₹{c.maxDiscount}</span>
                                                </div>
                                            )}
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Usage Limit:</span>
                                                <span className={styles.detailValue}>{c.usageLimit || "Unlimited"}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Valid To:</span>
                                                <span className={styles.detailValue}>
                                                    {c.endDate ? new Date(c.endDate).toLocaleDateString() : "Never Expires"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ScrollButtons />
            <Footer />
        </div>
    );
};

export default Coupon;