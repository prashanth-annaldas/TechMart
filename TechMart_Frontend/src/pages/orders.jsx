import { useEffect, useState } from "react";
import api from "../services/api";

function Orders() {

    const [orders, setOrders] = useState([]);

    const loadOrders = async () => {
        try {
            const res = await api.get("/api/orders");
            console.log(res.data);
            setOrders(res.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <div>
            <h1>Orders Page</h1>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {orders.map(order => (
                    <div key={order.id} style={{ margin: "10px", padding: "10px", border: "1px solid #ccc" }}>
                        <img src={order.imageUrl} alt={order.productName} style={{ width: "100px" }} />
                        <p>Product: {order.productName}</p>
                        <p>Price: {order.totalAmount.toFixed(2)}</p>
                        <p>Quantity: {order.quantity}</p>
                        <p>Order ID: {order.orderId}</p>
                        <p>Status: {order.status}</p>
                        <p>City: {order.city}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Orders;