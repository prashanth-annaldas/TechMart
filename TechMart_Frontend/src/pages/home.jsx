import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import '../App.css';
import AddressSelector from "../components/AddressSelector";

const Home = () => {

    const [isCustomer, setIsCustomer] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [addresses, setAddress] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const navigate = useNavigate();

    const loadProducts = async () => {
        try {
            const res = await api.get("/api/products");
            setProducts(res.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        loadProducts();
        getAllAddresses();
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await api.get("/api/categories");
            console.log(res.data);
            setCategories(res.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleAddToCart = async (productId) =>{
        try{
            const res = await api.post("/api/cart/addToCart", {
                productId,
                quantity: 2
            });
            if(res.data === "ALREADY EXISTS"){
                alert("ALREADY EXISTS");
            }
            else{
                alert("Added to cart successully");
            }
        }
        catch(error){
            console.log(error);
            alert("Failted to add to cart");
        }
    }

    const handleBuyNow = async (productId) => {
        setSelectedProductId(productId);
        await getAllAddresses();
        setShowAddressModal(true);
    }

    const placeOrder = async (productId, selectedAddressId, quantity) =>{
        if(!selectedAddressId) {
            alert("Please select an address");
            return;
        }

        try {
            await api.post("/api/orders/buyNow",
                {
                    productId: selectedProductId,
                    quantity: quantity,
                    addressId: selectedAddressId
                }
            );
            alert("Order Placed");
            setShowAddressModal(false);
            navigate("/orders");
        }
        catch (error) {
            console.log(error);
            alert("Failed to place order");
        }
    }

    const getAllAddresses = async () => {
        try {
            const res = await api.get("/api/profile/allAddresses");
            setAddress(res.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleAddToWishlist = async (productId) =>{
        try{
            const res = await api.post("/api/wishlist/add",
                {
                    productId: productId
                }
            );
            alert("Added to Wishlist");
        }
        catch (error) {
            console.log(error);
            alert("Failed to add to wishlist");
        }
    }

    return (
        <div>
            <Navbar />
            <h1>Welcome to TechMart</h1>
            <h2>Categories</h2>
            <div className="categories-container">
                {categories.map(category => (
                    <a 
                        key={category.id}
                        href={`/category/${category.id}`}
                        className="category-link"
                    >
                        {category.name}
                    </a>
                ))}
            </div>
            <h2>Products</h2>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {products.map(product => (
                    <div key={product.id}
                        style={{
                            margin: "10px",
                            border: "1px solid gray",
                            padding: "10px",
                            width: "250px"
                        }}>
                        <img src={product.imageUrl} alt={product.name} style={{ width: "150px", height: "150px" }} />
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>Price: {product.price.toFixed(2)}</p>
                        <button onClick={() => handleAddToWishlist(product.id)}>Wishlist</button>
                        <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
                        <button onClick={() => handleBuyNow(product.id)}>Buy Now</button>
                    </div>
                ))}
            </div>
            {
                showAddressModal && (
                    <AddressSelector
                        productId={selectedProductId}
                        onClose={() => setShowAddressModal(false)}
                        onPlaceOrder={placeOrder}
                    />
                )
            }
        </div>
    );
}

export default Home;