import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import api from "../services/api";

const Home = () => {

    const [isCustomer, setIsCustomer] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        currentUser();
    }, []);

    const currentUser = async () =>{
        try {
            const res = await api.get("/api/auth/me");

            if(res.data.role === "ROLE_CUSTOMER"){
                setIsCustomer(true);
            }
            else if(res.data.role === "ROLE_ADMIN"){
                setIsAdmin(true);
            }
        }
        catch(error){
            setIsCustomer(false);
            setIsAdmin(false);
        }
    }

    return (
        <div>
            <Navbar isCustomer={isCustomer} isAdmin={isAdmin} currentUser={currentUser}/>
            <h1>Welcome to TechMart</h1>
        </div>
    );
}

export default Home;