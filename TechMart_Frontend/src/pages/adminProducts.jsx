import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import styles from "./AdminProducts.module.css";
import ScrollButtons from "../components/ScrollButtons";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

const AdminProducts = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const { showToast } = useToast();

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

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
                await Promise.all([loadProducts(), loadCategories()]);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const res = await api.get("/api/products");
            setProducts(res.data);
        }
        catch (error) {
            console.error("Failed to load products:", error);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await api.get("/api/categories");
            setCategories(res.data);
        }
        catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !price || !stock || !categoryId || !imageUrl) {
            showToast("Please fill in all required fields.", "warning");
            return;
        }

        try {
            const productData = {
                name,
                price: Number(price),
                stock: Number(stock),
                description,
                categoryId: Number(categoryId),
                imageUrl
            };

            if (editingId) {
                await api.put(`/api/admin/editProduct/${editingId}`, productData);
                showToast("Product Updated successfully!", "success");
            } else {
                await api.post("/api/admin/products", productData);
                showToast("Product Added successfully!", "success");
            }

            // Reset Form
            setName("");
            setPrice("");
            setStock("");
            setDescription("");
            setCategoryId("");
            setImageUrl("");
            setEditingId(null);
            setShowForm(false);

            loadProducts();
        }
        catch (error) {
            console.error("Product submission failed:", error);
            showToast("Operation Failed. Please verify fields.", "error");
        }
    };

    const handleEditProduct = (product) => {
        setEditingId(product.id);
        setName(product.name);
        setPrice(product.price);
        setStock(product.stock);
        setDescription(product.description);
        setCategoryId(product.category?.id || "");
        setImageUrl(product.imageUrl);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteProduct = async (productId) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this product?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/api/admin/removeProduct/${productId}`);
            showToast("Product Removed successfully!", "success");
            loadProducts();
        }
        catch (error) {
            console.error("Failed to remove product:", error);
            showToast("Failed to remove product", "error");
        }
    };

    const openAddForm = () => {
        setEditingId(null);
        setName("");
        setPrice("");
        setStock("");
        setDescription("");
        setCategoryId("");
        setImageUrl("");
        setShowForm(true);
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
                <div className={styles.headerRow}>
                    <h1 className={styles.pageTitle}>Product Management</h1>
                    {!showForm && (
                        <button className={styles.addBtn} onClick={openAddForm}>
                            <FiPlus style={{ marginRight: "4px" }} /> Add New Product
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className={styles.formCard}>
                        <h2 className={styles.formTitle}>
                            {editingId ? "Edit Product Details" : "Add New Product"}
                        </h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Product Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. MacBook Air M3"
                                        className={styles.input}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Category *</label>
                                    <select
                                        className={styles.select}
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Price (₹) *</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 99900"
                                        className={styles.input}
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Initial Stock *</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 25"
                                        className={styles.input}
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label className={styles.label}>Image URL *</label>
                                    <input
                                        type="text"
                                        placeholder="Paste image URL here"
                                        className={styles.input}
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label className={styles.label}>Product Description</label>
                                    <textarea
                                        placeholder="Provide detailed product specifications..."
                                        className={styles.textarea}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    {editingId ? "Update Product" : "Add Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className={styles.divider}></div>
                
                <h2 className={styles.sectionTitle}>Inventory List</h2>

                {products.length === 0 ? (
                    <p className={styles.emptyText}>No products found. Add some to get started.</p>
                ) : (
                    <div className={styles.productsGrid}>
                        {products.map(product => {
                            const isAvailable = product.stock > 0;
                            return (
                                <div key={product.id} className={styles.productCard}>
                                    <div className={styles.imageWrap}>
                                        <img
                                            src={product.imageUrl || "/placeholder.png"}
                                            alt={product.name}
                                            className={styles.productImage}
                                        />
                                    </div>

                                    <div className={styles.productDetails}>
                                        {product.category && (
                                            <span className={styles.productCategory}>
                                                {product.category.name}
                                            </span>
                                        )}
                                        <h3 className={styles.productName}>{product.name}</h3>
                                        <p className={styles.productDesc}>{product.description}</p>
                                        
                                        <div className={styles.metaRow}>
                                            <span className={styles.productPrice}>₹{product.price?.toLocaleString("en-IN")}</span>
                                            <span className={`${styles.productStock} ${isAvailable ? styles.inStock : styles.outOfStock}`}>
                                                Qty: {product.stock}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.editCardBtn}
                                            onClick={() => handleEditProduct(product)}
                                        >
                                            <FiEdit2 size={14} style={{ marginRight: "6px" }} /> Edit
                                        </button>
                                        <button
                                            className={styles.deleteCardBtn}
                                            onClick={() => handleDeleteProduct(product.id)}
                                        >
                                            <FiTrash2 size={14} style={{ marginRight: "6px" }} /> Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <ScrollButtons />
            <Footer />
        </div>
    );
};

export default AdminProducts;