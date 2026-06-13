import { useEffect, useState } from "react";
import api from "../services/api";
import AddressSelector from "../components/AddressSelector";

function Wishlist(){

    const [wishlist, setWishlist] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const loadWishlist = async () => {
        try {
            const res = await api.get("/api/wishlist");
            setWishlist(res.data);
        }
        catch (error) {
            console.log(error);
            alert("Failed to load wishlist");
        }
    }

    useEffect(() => {
        loadWishlist();
    }, []);

    const handleBuyNow = async (productId) => {
        setSelectedProductId(productId);
        setShowAddressModal(true);
    }

    const placeOrder = async (productId, selectedAddressId, quantity) => {
        if (!selectedAddressId) {
            alert("Please select an address");
            return;
        }

        try {

            await api.post("/api/orders/buyNow", {
                productId,
                quantity: quantity,
                addressId: selectedAddressId
            });

            alert("Order Placed");

            setShowAddressModal(false);

        }
        catch (error) {
            console.log(error);
            alert("Failed to place order");
        }
    };

    const handleRemoveItem = async (wishlistItemId) =>{
        try{
            const res = await api.post("/api/wishlist/removeItem", {wishlistItemId});

            loadWishlist();
        }
        catch(error){
            console.log(error);
            alert("Failed to remove item");
        }
    }

    const handleAddToCart = async (productId) =>{
        try{
            const res = await api.post("/api/cart/addToCart", {
                productId,
                quantity: 1
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

    return (
        <div>
            <h1>Wishlist</h1>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {wishlist.map(item => (
                    <div key={item.wishlistItemId} style={{ margin: "10px" }}>
                        <img src={item.imageUrl} alt={item.productName} style={{ width: "150px", height: "150px" }} />
                        <h3>{item.productName}</h3>
                        <p>{item.description}</p>
                        <p>Price: {item.price.toFixed(2)}</p>
                        <button onClick={() => handleAddToCart(item.productId)}>Add to Cart</button>
                        <button onClick={() => handleBuyNow(item.productId)}>Buy Now</button>      
                        <button onClick={() => handleRemoveItem(item.wishlistItemId)}>Remove</button>      
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

export default Wishlist;