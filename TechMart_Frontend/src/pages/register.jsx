import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: ""
    });

    const navigate = useNavigate();

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
                navigate("/login");
            }
            else if(res.data === "USER ALREADY EXISTS") {
                alert("User already exists");
            }
        }
        catch (error) {
            console.log(error);
            alert("Registration Failed");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>

            <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={handleChange}
            /> <br /> <br />

            <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
            /><br /> <br />

            <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
            /><br /> <br />

            <button type="submit">
                Register
            </button>
        </form>
    );
}

export default Register;