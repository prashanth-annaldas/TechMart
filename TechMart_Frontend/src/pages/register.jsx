import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import styles from "./Auth.module.css";

function Register() {

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: ""
    });

    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post(
                "/api/auth/myregister",
                user
            );

            if(res.data === "REGISTERED") {
                showToast("Registration successful! Please login.", "success");
                navigate("/login");
            }
            else if(res.data === "USER ALREADY EXISTS") {
                showToast("User already exists", "warning");
            }
        }
        catch (error) {
            console.log(error);
            showToast("Registration Failed", "error");
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authBrand}>
                <div className={styles.brandLogo}>
                    Tech<span className={styles.brandLogoAccent}>Mart</span>
                </div>
                <p className={styles.brandTagline}>
                    Create your account and start shopping for the latest tech.
                </p>
                <div className={styles.brandFeatures}>
                    <div className={styles.brandFeature}>
                        <span className={styles.brandFeatureIcon}>⚡</span>
                        Quick and easy checkout
                    </div>
                    <div className={styles.brandFeature}>
                        <span className={styles.brandFeatureIcon}>❤️</span>
                        Save favorites to your wishlist
                    </div>
                    <div className={styles.brandFeature}>
                        <span className={styles.brandFeatureIcon}>📦</span>
                        Track orders in real-time
                    </div>
                </div>
            </div>

            <div className={styles.authForm}>
                <div className={styles.formCard}>
                    <h2 className={styles.formTitle}>Create Account</h2>
                    <p className={styles.formSubtitle}>Join TechMart to start shopping</p>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                className={styles.formInput}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Email address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                className={styles.formInput}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                className={styles.formInput}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Create Account
                        </button>
                    </form>

                    <p className={styles.formFooter}>
                        Already have an account?
                        <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;