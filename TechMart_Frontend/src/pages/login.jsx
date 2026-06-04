import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

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
                alert("Login successful");
                navigate("/");
            }
            else if(response.data.message === "INVALID CREDENTIALS") {
                alert("Invalid Credentials");
            }
            else if(response.data.message === "USER NOT FOUND") {
                alert("User not found");
            }
        }
        catch (error) {
            console.log(error);
            alert("Invalid Credentials");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
            /> <br /> <br />

            <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
            /> <br /> <br />

            <button type="submit">
                Login
            </button>
        </form>
    );
}

export default Login;