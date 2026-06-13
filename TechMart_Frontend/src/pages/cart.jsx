import { useEffect, useState } from "react";
import api from "../services/api";
import AddressSelector from "../components/addressSelector";

function Cart(){

    const [cart, setCart] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const loadCartItems = async () =>{
        try{
            const res = await api.get("/api/cart");
            setCart(res.data);
            console.log(res.data);
        }
        catch(err){
            console.log(err);
            alert("Failed to load cart items");
        }
    }

    useEffect(() =>{
        loadCartItems();
    }, []);

    const removeCartItem = async (cartItemId) =>{
        try{
            console.log("Removing:", cartItemId);
            const res = await api.post("/api/cart/removeCartItem", {cartItemId});

            loadCartItems();
        }
        catch(err){
            console.log(err);
            alert("Failed to remove cart item");
        }
    }

    const handleBuyNow = async (productId) =>{
        setSelectedProductId(productId);
        setShowAddressModal(true);
    }

    const placeOrder = async (productId, selectedAddressId) => {
        if (!selectedAddressId) {
            alert("Please select an address");
            return;
        }

        try {

            await api.post("/api/orders/buyNow", {
                productId,
                quantity: 1,
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

    return (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            <h1>Cart List: </h1>
            {cart.map(item => (
                <div key={item.CartItemId} style={{ margin: "10px" }}>
                    <img src={item.imageUrl} alt={item.productName} style={{ width: "150px", height: "150px" }} />
                    <h3>{item.productName}</h3>
                    <p>{item.description}</p>
                    <p>Price: {item.totalAmount.toFixed(2)}</p>
                    <button onClick={() => removeCartItem(item.CartItemId)}>Remove</button>
                    <button onClick={() => handleBuyNow(item.productId)}>Buy now</button>
                </div>
            ))}

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

export default Cart;