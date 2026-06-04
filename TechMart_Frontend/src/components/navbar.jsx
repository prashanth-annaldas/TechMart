import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar({ isCustomer, isAdmin, currentUser }) {

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await api.post("/api/auth/mylogout");
            if(res.data === "LOGOUT SUCCESSFULL"){
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
                    <Link to="/admin">Admin Panel</Link>
                    <Link to="/products">Manage Products</Link>
                    <Link to="/orders">Manage Orders</Link>
                    <Link to="/adminProduct">Add Product</Link>
                    <Link to="/adminCategory">Add Category</Link>
                </>
            )}
        </nav>
    );
}

export default Navbar;