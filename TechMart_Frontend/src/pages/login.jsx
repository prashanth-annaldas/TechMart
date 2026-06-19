import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import styles from "./Auth.module.css";

function Login() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await api.post(
                "/api/auth/mylogin",
                loginData
            );

            if(response.data.message === "LOGINNED") {
                showToast("Login successful", "success");
                navigate("/");
            }
            else if(response.data.message === "INVALID CREDENTIALS") {
                showToast("Invalid Credentials", "error");
            }
            else if(response.data.message === "USER NOT FOUND") {
                showToast("User not found", "error");
            }
        }
        catch (error) {
            console.log(error);
            showToast("Invalid Credentials", "error");
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authBrand}>
                <div className={styles.brandLogo}>
                    Tech<span className={styles.brandLogoAccent}>Mart</span>
                </div>
                <p className={styles.brandTagline}>
                    Your premium destination for the latest tech at the best prices.
                </p>
                <div className={styles.brandFeatures}>
                    <div className={styles.brandFeature}>
                        <span className={styles.brandFeatureIcon}>🚚</span>
                        Free delivery on orders above ₹999
                    </div>
                    <div className={styles.brandFeature}>
                        <span className={styles.brandFeatureIcon}>🔄</span>
                        7-day easy returns
                    </div>
                    <div className={styles.brandFeature}>
                        <span className={styles.brandFeatureIcon}>🛡️</span>
                        1-year warranty on all products
                    </div>
                </div>
            </div>

            <div className={styles.authForm}>
                <div className={styles.formCard}>
                    <h2 className={styles.formTitle}>Welcome back</h2>
                    <p className={styles.formSubtitle}>Sign in to your TechMart account</p>

                    <form onSubmit={handleSubmit}>
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
                                placeholder="Enter your password"
                                className={styles.formInput}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Sign In
                        </button>
                    </form>

                    <p className={styles.formFooter}>
                        Don't have an account?
                        <Link to="/register">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;