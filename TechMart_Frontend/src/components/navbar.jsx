import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import styles from "./Navbar.module.css";
import { 
    FiSearch, 
    FiSun, 
    FiMoon, 
    FiHeart, 
    FiShoppingCart, 
    FiHome, 
    FiBox, 
    FiUser, 
    FiClipboard, 
    FiFolder 
} from "react-icons/fi";
import { RiAi } from "react-icons/ri";

function Navbar({ searchVal, setSearchVal, loadSuggestions, suggestions, setSuggestions }) {

    const [isCustomer, setIsCustomer] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [userName, setUserName] = useState("User");
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        currentUser();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(`.${styles.profileMenuWrap}`)) {
                setProfileMenuOpen(false);
            }
        };
        if (profileMenuOpen) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [profileMenuOpen]);

    const currentUser = async () => {
        try {
            const res = await api.get("/api/auth/me");
            const rawName = res.data.name || res.data.email || "User";
            const displayName = rawName.includes("@") ? rawName.split("@")[0] : rawName;
            setUserName(displayName);

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

                <div className={styles.navActions}>
                    <div className={styles.searchWrap}>
                        <input
                            type="search"
                            className={styles.searchInput}
                            placeholder="Search products..."
                            value={searchVal}
                            onChange={(e) => {setSearchVal(e.target.value); loadSuggestions(e.target.value)}}
                        />
                        <FiSearch className={styles.searchIcon} />
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

                    <Link to="/ai" className={styles.iconBtn} title="AI Assistant">
                        <RiAi size={22} />
                    </Link>

                    {isCustomer && (
                        <>
                            <Link to="/wishlist" className={styles.iconBtn} title="Wishlist">
                                <FiHeart size={20} />
                            </Link>
                            <Link to="/cart" className={styles.iconBtn} title="Cart">
                                <FiShoppingCart size={20} />
                            </Link>
                        </>
                    )}

                    {!isCustomer && !isAdmin && (
                        <>
                            <Link to="/login" className={styles.loginBtn}>Sign in</Link>
                            <Link to="/register" className={styles.registerLink}>Sign up</Link>
                        </>
                    )}

                    {(isCustomer || isAdmin) && (
                        <div className={styles.profileMenuWrap}>
                            <button 
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
                                className={styles.profileIconBtn}
                                title="Account Menu"
                            >
                                <FiUser size={20} />
                            </button>
                            {profileMenuOpen && (
                                <div className={styles.profileMenu}>
                                    <div className={styles.profileMenuHeader}>
                                        <FiUser size={14} className={styles.headerIcon} />
                                        <span className={styles.profileName}>{userName}</span>
                                    </div>
                                    <div className={styles.profileMenuDivider}></div>
                                    <Link to="/profile" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                                        Profile
                                    </Link>
                                    {isCustomer && (
                                        <>
                                            <Link to="/orders" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                                                My Orders
                                            </Link>
                                            <Link to="/payments/history" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                                                Payment History
                                            </Link>
                                        </>
                                    )}
                                    {isAdmin && (
                                        <>
                                            <div className={styles.profileMenuDivider}></div>
                                            <div className={styles.profileMenuHeader} style={{ padding: "4px 16px 2px", opacity: 0.7, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                Admin Panel
                                            </div>
                                            <Link to="/admin/products" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                                                Manage Products
                                            </Link>
                                            <Link to="/admin/categories" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                                                Manage Categories
                                            </Link>
                                            <Link to="/admin/orders" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                                                Manage Orders
                                            </Link>
                                        </>
                                    )}
                                    <div className={styles.profileMenuDivider}></div>
                                    <Link to="/profile?tab=Account" className={styles.profileMenuItem} onClick={() => setProfileMenuOpen(false)}>
                                        Settings
                                    </Link>
                                    <button onClick={() => { handleLogout(); setProfileMenuOpen(false); }} className={styles.profileMenuLogoutBtn}>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
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
                    <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                        <FiHome className={styles.navLinkIcon} /> Home
                    </Link>
                    <Link to="/products" className={`${styles.navLink} ${location.pathname === '/products' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                        <FiBox className={styles.navLinkIcon} /> Products
                    </Link>
                    {isCustomer && (
                        <>
                            <Link to="/profile" className={`${styles.navLink} ${location.pathname === '/profile' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                                <FiUser className={styles.navLinkIcon} /> Profile
                            </Link>
                            <Link to="/orders" className={`${styles.navLink} ${location.pathname === '/orders' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                                <FiBox className={styles.navLinkIcon} /> My Orders
                            </Link>
                            <Link to="/cart" className={`${styles.navLink} ${location.pathname === '/cart' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                                <FiShoppingCart className={styles.navLinkIcon} /> Cart
                            </Link>
                            <Link to="/wishlist" className={`${styles.navLink} ${location.pathname === '/wishlist' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                                <FiHeart className={styles.navLinkIcon} /> Wishlist
                            </Link>
                        </>
                    )}
                    {isAdmin && (
                        <>
                            <Link to="/admin/products" className={`${styles.navLink} ${location.pathname === '/admin/products' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                                <FiBox className={styles.navLinkIcon} /> Admin Products
                            </Link>
                            <Link to="/admin/orders" className={`${styles.navLink} ${location.pathname === '/admin/orders' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                                <FiClipboard className={styles.navLinkIcon} /> Admin Orders
                            </Link>
                            <Link to="/admin/categories" className={`${styles.navLink} ${location.pathname === '/admin/categories' ? styles.navLinkActive : ''}`} onClick={() => setMobileOpen(false)}>
                                <FiFolder className={styles.navLinkIcon} /> Admin Categories
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;