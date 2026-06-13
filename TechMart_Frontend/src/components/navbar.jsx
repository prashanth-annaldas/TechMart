import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useEffect, useState } from "react";

function Navbar({ searchVal, setSearchVal }) {

    const [isCustomer, setIsCustomer] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

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
        <nav>
            <Link to="/">Home</Link>
            <input type="text" value={searchVal} onChange={(e) => setSearchVal(e.target.value)} />
            {!isCustomer && !isAdmin && (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}

            {(isCustomer || isAdmin) && (
                <button onClick={handleLogout}>Logout</button>
            )}
            {isCustomer && (
                <>
                    <Link to="/profile">Profile</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/cart">Cart</Link>
                    <Link to="/wishlist">Wishlist</Link>
                </>
            )}
            {isAdmin && (
                <>
                    <Link to="/admin">Admin Dashboard</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/adminOrders">Orders</Link>
                    <Link to="/categories">Category</Link>
                </>
            )}
        </nav>
    );
}

export default Navbar;