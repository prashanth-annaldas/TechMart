import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import styles from "./Navbar.module.css";

function Navbar({ searchVal, setSearchVal, loadSuggestions, suggestions, setSuggestions }) {

    const [isCustomer, setIsCustomer] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        currentUser();
    }, []);

    const currentUser = async () => {
        try {
            const res = await api.get("/api/auth/me");

            if (res.data.role === "ROLE_CUSTOMER") {
                setIsCustomer(true);
                setIsAdmin(false);
            }
            else if (res.data.role === "ROLE_ADMIN") {
                setIsAdmin(true);
                setIsCustomer(false);
            }
        }
        catch (error) {
            setIsCustomer(false);
            setIsAdmin(false);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await api.post("/api/auth/mylogout");
            if(res.data === "LOGOUT SUCCESSFULL"){
                setIsCustomer(false);
                setIsAdmin(false);
                navigate("/");
                currentUser();
            }
        }
        catch(error){
            console.log(error);
            alert("Logout failed");
        }
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.navInner}>
                <Link to="/" className={styles.logo}>
                    Tech<span className={styles.logoAccent}>Mart</span>
                </Link>

                <div className={styles.searchWrap}>
                    <input
                        type="search"
                        className={styles.searchInput}
                        placeholder="Search products..."
                        value={searchVal}
                        onChange={(e) => {setSearchVal(e.target.value); loadSuggestions(e.target.value)}}
                    />
                    <span className={styles.searchIcon}>🔍</span>
                    <div className={styles.suggestions}>
                        {
                            suggestions?.length > 0 && (
                                <div className={styles.suggestions}>
                                    {suggestions.map((item,index)=>(
                                        <div
                                            key={index}
                                            className={styles.suggestionItem}
                                            onClick={()=>{
                                                setSearchVal(item);
                                                setSuggestions([]);
                                            }}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </div>
                </div>

                <div className={styles.navLinks}>
                    <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.navLinkActive : ''}`}>Home</Link>
                    <Link to="/products" className={`${styles.navLink} ${location.pathname === '/products' ? styles.navLinkActive : ''}`}>Products</Link>

                    {isCustomer && (
                        <>
                            <Link to="/orders" className={`${styles.navLink} ${location.pathname === '/orders' ? styles.navLinkActive : ''}`}>
                                Orders
                            </Link>
                            <Link to="/profile" className={`${styles.navLink} ${location.pathname === '/profile' ? styles.navLinkActive : ''}`}>
                                Profile
                            </Link>
                            <Link to="/payments/history" className={`${styles.navLink} ${location.pathname === '/payments/history' ? styles.navLinkActive : ''}`}>
                                Payments History
                            </Link>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <Link to="/admin/products" className={`${styles.navLink} ${location.pathname === '/admin/products' ? styles.navLinkActive : ''}`}>Admin Products</Link>
                            <Link to="/admin/orders" className={`${styles.navLink} ${location.pathname === '/admin/orders' ? styles.navLinkActive : ''}`}>Admin Orders</Link>
                            <Link to="/admin/categories" className={`${styles.navLink} ${location.pathname === '/admin/categories' ? styles.navLinkActive : ''}`}>Admin Categories</Link>
                        </>
                    )}
                </div>

                <div className={styles.navActions}>
                    <button onClick={toggleTheme} className={styles.themeToggle} title="Toggle theme">
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>

                    {isCustomer && (
                        <>
                            <Link to="/wishlist" className={styles.iconBtn} title="Wishlist">❤️</Link>
                            <Link to="/cart" className={styles.iconBtn} title="Cart">🛒</Link>
                        </>
                    )}

                    {!isCustomer && !isAdmin && (
                        <>
                            <Link to="/login" className={styles.loginBtn}>Sign in</Link>
                            <Link to="/register" className={styles.registerLink}>Sign up</Link>
                        </>
                    )}

                    {(isCustomer || isAdmin) && (
                        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                    )}

                    <button
                        className={styles.hamburger}
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className={styles.mobileMenu}>
                    <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>🏠 Home</Link>
                    <Link to="/products" className={`${styles.navLink} ${location.pathname === '/products' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>📦 Products</Link>
                    {isCustomer && (
                        <>
                            <Link to="/profile" className={`${styles.navLink} ${location.pathname === '/profile' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>👤 Profile</Link>
                            <Link to="/orders" className={`${styles.navLink} ${location.pathname === '/orders' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>📦 My Orders</Link>
                            <Link to="/cart" className={`${styles.navLink} ${location.pathname === '/cart' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>🛒 Cart</Link>
                            <Link to="/wishlist" className={`${styles.navLink} ${location.pathname === '/wishlist' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>❤️ Wishlist</Link>
                        </>
                    )}
                    {isAdmin && (
                        <>
                            <Link to="/admin/products" className={`${styles.navLink} ${location.pathname === '/admin/products' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>📦 Admin Products</Link>
                            <Link to="/admin/orders" className={`${styles.navLink} ${location.pathname === '/admin/orders' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>📋 Admin Orders</Link>
                            <Link to="/admin/categories" className={`${styles.navLink} ${location.pathname === '/admin/categories' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>📁 Admin Categories</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;