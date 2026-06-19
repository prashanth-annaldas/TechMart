import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { useToast } from "../context/ToastContext";
import styles from './AdminCategories.module.css';
import ScrollButtons from "../components/ScrollButtons";

const AdminCategories = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const { showToast } = useToast();
    
    // Form State
    const [category, setCategory] = useState({
        name: "",
        description: ""
    });

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
                loadCategories();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await api.get("/api/categories");
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    const handleChange = (e) => {
        setCategory({
            ...category,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category.name || !category.description) {
            showToast("Please fill in all fields.", "warning");
            return;
        }

        try {
            const res = await api.post("/api/admin/categories", category);
            showToast("Category Created Successfully!", "success");
            setCategory({
                name: "",
                description: ""
            });
            loadCategories();
        }
        catch (error) {
            console.error("Category creation failed:", error);
            showToast("Category Creation Failed", "error");
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
                <h1 className={styles.pageTitle}>Category Management</h1>

                <div className={styles.layout}>
                    {/* Left Panel: Form */}
                    <div className={styles.formCard}>
                        <h2 className={styles.sectionTitle}>Add New Category</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Wearables"
                                    className={styles.input}
                                    value={category.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup} style={{ marginTop: "16px" }}>
                                <label className={styles.label}>Description *</label>
                                <textarea
                                    name="description"
                                    placeholder="Provide category description details..."
                                    className={styles.textarea}
                                    value={category.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.submitBtn}>
                                Create Category
                            </button>
                        </form>
                    </div>

                    {/* Right Panel: Listing */}
                    <div className={styles.listCard}>
                        <h2 className={styles.sectionTitle}>Saved Categories</h2>
                        
                        {categories.length === 0 ? (
                            <p className={styles.emptyText}>No categories found.</p>
                        ) : (
                            <div className={styles.categoryList}>
                                {categories.map(cat => (
                                    <div key={cat.id} className={styles.categoryItem}>
                                        <h3 className={styles.categoryName}>{cat.name}</h3>
                                        <p className={styles.categoryDesc}>{cat.description}</p>
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

export default AdminCategories;