import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";

function Profile() {

    const emptyForm = {
        fullName: "",
        phoneNumber: "",
        houseNo: "",
        street: "",
        landmark: "",
        city: "",
        state: "",
        country: "",
        pincode: ""
    };

    const [addresses, setAddresses] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const res = await api.get(
                "/api/profile/allAddresses"
            );

            console.log(res.data);

            if (Array.isArray(res.data)) {
                setAddresses(res.data);
            } else {
                setAddresses([]);
            }
        }
        catch (error) {
            console.log(error);
            setAddresses([]);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const addNewAddress = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
    };

    const editAddress = (address) => {

        setEditingId(address.id);

        setForm({
            fullName: address.fullName || "",
            phoneNumber: address.phoneNumber || "",
            houseNo: address.houseNo || "",
            street: address.street || "",
            landmark: address.landmark || "",
            city: address.city || "",
            state: address.state || "",
            country: address.country || "",
            pincode: address.pincode || ""
        });

        setShowForm(true);
    };

    const saveAddress = async (e) => {

        e.preventDefault();

        try {

            if (editingId) {

                await api.put(
                    `/api/profile/editAddress/${editingId}`,
                    form
                );

                alert("Address Updated");

            } else {

                await api.post(
                    "/api/profile/address",
                    form
                );

                alert("Address Saved");
            }

            setForm(emptyForm);
            setEditingId(null);
            setShowForm(false);

            loadAddresses();

        }
        catch (error) {
            console.log(error);
            alert("Operation Failed");
        }
    };

    const deleteAddress = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this address?"
        );

        if (!confirmDelete) return;

        try {

            await api.delete(
                `/api/profile/deleteAddress/${id}`
            );

            alert("Address Deleted");

            loadAddresses();

        }
        catch (error) {
            console.log(error);
            alert("Delete Failed");
        }
    };

    return (
        <div>

            <Navbar />

            <h1>My Profile</h1>

            <button onClick={addNewAddress}>
                Add New Address
            </button>

            <br />
            <br />

            {showForm && (

                <form onSubmit={saveAddress}>

                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={handleChange}
                    />
                    <br /><br />

                    <input
                        type="text"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={form.phoneNumber}
                        onChange={handleChange}
                    />
                    <br /><br />

                    <input
                        type="text"
                        name="houseNo"
                        placeholder="House No"
                        value={form.houseNo}
                        onChange={handleChange}
                    />
                    <br /><br />

                    <input
                        type="text"
                        name="street"
                        placeholder="Street"
                        value={form.street}
                        onChange={handleChange}
                    />
                    <br /><br />

                    <input
                        type="text"
                        name="landmark"
                        placeholder="Landmark"
                        value={form.landmark}
                        onChange={handleChange}
                    />
                    <br /><br />

                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                    />
                    <br /><br />

                    <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={form.state}
                        onChange={handleChange}
                    />
                    <br /><br />

                    <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={form.country}
                        onChange={handleChange}
                    />
                    <br /><br />

                    <input
                        type="text"
                        name="pincode"
                        placeholder="Pincode"
                        value={form.pincode}
                        onChange={handleChange}
                    />
                    <br /><br />

                    <button type="submit">
                        {editingId
                            ? "Update Address"
                            : "Save Address"}
                    </button>

                </form>
            )}

            <hr />

            <h2>My Addresses</h2>

            {addresses.length === 0 ? (
                <p>No addresses found.</p>
            ) : (
                addresses.map((address) => (
                    <div
                        key={address.id}
                        style={{
                            border: "1px solid black",
                            padding: "10px",
                            marginBottom: "15px"
                        }}
                    >
                        <h3>{address.fullName}</h3>

                        <p>
                            <strong>Phone:</strong>
                            {" "}
                            {address.phoneNumber}
                        </p>

                        <p>
                            {address.houseNo},
                            {" "}
                            {address.street}
                        </p>

                        <p>
                            {address.landmark},
                            {" "}
                            {address.city}
                        </p>

                        <p>
                            {address.state},
                            {" "}
                            {address.country}
                        </p>

                        <p>
                            {address.pincode}
                        </p>

                        <button
                            onClick={() =>
                                editAddress(address)
                            }
                        >
                            Edit
                        </button>

                        {" "}

                        <button
                            onClick={() =>
                                deleteAddress(address.id)
                            }
                        >
                            Delete
                        </button>

                    </div>
                ))
            )}

        </div>
    );
}

export default Profile;