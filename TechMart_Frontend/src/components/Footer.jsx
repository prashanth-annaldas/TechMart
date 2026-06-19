import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                <div className={styles.footerGrid}>
                    <div className={styles.footerBrand}>
                        <div className={styles.footerLogo}>
                            Tech<span className={styles.footerLogoAccent}>Mart</span>
                        </div>
                        <p className={styles.footerTagline}>
                            Your premium destination for the latest laptops, smartphones, audio gear, and tech accessories.
                        </p>
                    </div>

                    <div className={styles.footerCol}>
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">All Products</Link></li>
                            <li><Link to="/cart">Cart</Link></li>
                            <li><Link to="/wishlist">Wishlist</Link></li>
                        </ul>
                    </div>

                    <div className={styles.footerCol}>
                        <h4>Customer Service</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Shipping Info</a></li>
                            <li><a href="#">Returns & Exchanges</a></li>
                            <li><a href="#">Order Tracking</a></li>
                        </ul>
                    </div>

                    <div className={styles.footerCol}>
                        <h4>Contact Us</h4>
                        <ul>
                            <li><a href="mailto:support@techmart.com">support@techmart.com</a></li>
                            <li><a href="tel:+911234567890">+91 12345 67890</a></li>
                            <li><a href="#">Mumbai, India</a></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p className={styles.footerCopy}>© 2026 TechMart. All rights reserved.</p>
                    <div className={styles.footerBottomLinks}>
                        <a href="#">About</a>
                        <a href="#">Contact</a>
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
