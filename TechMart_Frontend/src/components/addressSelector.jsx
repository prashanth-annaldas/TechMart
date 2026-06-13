import { useEffect, useState } from "react";
import api from "../services/api";

function AddressSelector({ productId, onClose, onPlaceOrder }) {

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const res = await api.get("/api/profile/allAddresses");
            setAddresses(res.data);
        }
        catch (error) {
            console.log(error);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: "20%",
                left: "30%",
                width: "40%",
                background: "white",
                border: "1px solid black",
                padding: "20px"
            }}
        >
            <h2>Select Address</h2>

            {addresses.map(address => (

                <div key={address.id}>

                    <input
                        type="radio"
                        name="address"
                        value={address.id}
                        onChange={() =>
                            setSelectedAddressId(address.id)
                        }
                    />

                    <strong>{address.fullName}</strong>

                    <p>
                        {address.houseNo},
                        {" "}
                        {address.street}
                    </p>

                    <p>
                        {address.city},
                        {" "}
                        {address.state}
                    </p>

                </div>
            ))}

            <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{
                    border: "1px solid black",
                    marginTop: "10px",
                    display: "block"
                }}
            />

            <button
                onClick={() =>
                    onPlaceOrder(productId, selectedAddressId, quantity)
                }
            >
                Place Order
            </button>

            <button onClick={onClose}>
                Cancel
            </button>

        </div>
    );
}

export default AddressSelector;