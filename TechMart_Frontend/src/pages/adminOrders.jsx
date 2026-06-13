import { useEffect, useState } from "react";
import api from "../services/api";

const AdminOrders = () =>{

    const [orders, setOrders] = useState([]);

    const loadOrders = async () =>{
        try{
            const res = await api.get("/api/admin/orders");
            setOrders(res.data);
        }
        catch(err){
            console.log(err);
            alert("Failed to load admin orders");
        }
    }

    useEffect(() =>{
        loadOrders();
    }, []);

    const updateOrderStatus = async (orderId, status) =>{

        try{
            const res = await api.put(`/api/admin/orders/${orderId}/status`, {status});

            setOrders(prev =>{
                prev.map(order =>
                    order.orderId == orderId ? {...order, status} : {order}
                )
            });

            loadOrders();

            alert("Status updated");
        }
        catch(err){
            console.log(err);
            alert("Failed to update status");
        }
    }

    return (
        <div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {orders.map(order =>(
                    <div key={order.orderId} style={{ margin: "10px", padding: "10px", border: "1px solid #ccc" }}>
                        <img src={order.imageUrl} alt={order.productName} style={{ width: "100px" }} />
                        <p>Product: {order.productName}</p>
                        <p>Price: {order.totalAmount.toFixed(2)}</p>
                        <p>Quantity: {order.quantity}</p>
                        <p>Order ID: {order.orderId}</p>
                        <p>
                            <b>Status:</b>
                            <select
                                value={order.status}
                                onChange={(e) =>
                                    updateOrderStatus(order.orderId, e.target.value)
                                }
                            >
                                <option value="PLACED">PLACED</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        </p>
                        <p>Status: {order.status}</p>
                        <p>City: {order.city}</p>
                    </div>
                )   )}
            </div>
        </div>
    );
}

export default AdminOrders;