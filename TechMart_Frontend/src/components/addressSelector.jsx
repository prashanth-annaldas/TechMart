import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import styles from "./AddressSelector.module.css";

function AddressSelector({ productId, onClose, onPlaceOrder }) {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const res = await api.get("/api/profile/allAddresses");
            setAddresses(res.data);
            if (res.data.length > 0) {
                setSelectedAddressId(res.data[0].id);
            }
        } catch (error) {
            console.error("Failed to load addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Select Delivery Address</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
                        <div style={{ width: "30px", height: "30px", border: "2px solid #ccc", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className={styles.noAddresses}>
                        <p>No saved addresses found.</p>
                        <Link to="/profile" className={styles.addAddressLink} onClick={onClose}>
                            Go to Profile to add an address
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className={styles.addressList}>
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className={`${styles.addressCard} ${selectedAddressId === address.id ? styles.addressCardActive : ""}`}
                                    onClick={() => setSelectedAddressId(address.id)}
                                >
                                    <input
                                        type="radio"
                                        name="modalAddress"
                                        className={styles.radioInput}
                                        checked={selectedAddressId === address.id}
                                        onChange={() => setSelectedAddressId(address.id)}
                                    />
                                    <div className={styles.addressDetails}>
                                        <strong className={styles.fullName}>{address.fullName}</strong>
                                        <span>
                                            {address.houseNo}, {address.street}
                                        </span>
                                        <span>
                                            {address.city}, {address.state} - {address.pincode}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={styles.submitBtn}
                        onClick={() => onPlaceOrder(productId, selectedAddressId, quantity)}
                        disabled={!selectedAddressId}
                    >
                        Confirm Order
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddressSelector;