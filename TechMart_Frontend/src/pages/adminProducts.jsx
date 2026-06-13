import { useEffect, useState } from "react";
import api from "../services/api";

const AdminProducts = () => {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await api.get("/api/products");
            setProducts(res.data);
        }
        catch (error) {
            console.log(error);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await api.get("/api/categories");
            setCategories(res.data);
        }
        catch (error) {
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const productData = {
                name,
                price: Number(price),
                stock: Number(stock),
                description,
                categoryId: Number(categoryId),
                imageUrl
            };

            if (editingId) {

                await api.put(
                    `/api/admin/editProduct/${editingId}`,
                    productData
                );

                alert("Product Updated");

            } else {

                await api.post(
                    "/api/admin/products",
                    productData
                );

                alert("Product Added");
            }

            setName("");
            setPrice("");
            setStock("");
            setDescription("");
            setCategoryId("");
            setImageUrl("");

            setEditingId(null);
            setShowForm(false);

            loadProducts();

        }
        catch (error) {
            console.log(error);
            alert("Operation Failed");
        }
    };

    const handleEditProduct = (product) => {

        console.log(product);

        setEditingId(product.id);

        setName(product.name);
        setPrice(product.price);
        setStock(product.stock);
        setDescription(product.description);
        setCategoryId(product.category.id);
        setImageUrl(product.imageUrl);

        setShowForm(true);
    };

    const handleDeleteProduct = async (productId) => {

        try {

            const res = await api.delete(
                `/api/admin/removeProduct/${productId}`
            );

            alert("Product Removed");

            loadProducts();

        }
        catch (error) {
            console.log(error);
            alert("Failed to remove product");
        }
    };

    const openAddForm = () => {

        setEditingId(null);

        setName("");
        setPrice("");
        setStock("");
        setDescription("");
        setCategoryId("");
        setImageUrl("");

        setShowForm(true);
    };

    return (
        <div>

            <h1>Manage Products</h1>

            <button onClick={openAddForm}>
                Add Product
            </button>

            <br /><br />

            {showForm && (

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="Product Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                    <br /><br />

                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) =>
                            setPrice(e.target.value)
                        }
                    />

                    <br /><br />

                    <input
                        type="number"
                        placeholder="Stock"
                        value={stock}
                        onChange={(e) =>
                            setStock(e.target.value)
                        }
                    />

                    <br /><br />

                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                    />

                    <br /><br />

                    <select
                        value={categoryId}
                        onChange={(e) =>
                            setCategoryId(e.target.value)
                        }
                    >

                        <option value="">
                            Select Category
                        </option>

                        {categories.map(category => (

                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>

                        ))}

                    </select>

                    <br /><br />

                    <input
                        type="text"
                        placeholder="Image URL"
                        value={imageUrl}
                        onChange={(e) =>
                            setImageUrl(e.target.value)
                        }
                    />

                    <br /><br />

                    <button type="submit">
                        {editingId
                            ? "Update Product"
                            : "Add Product"}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setShowForm(false)
                        }
                    >
                        Cancel
                    </button>

                </form>
            )}

            <hr />

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap"
                }}
            >

                {products.length === 0 ? (

                    <p>No Products Found</p>

                ) : (

                    products.map(product => (

                        <div
                            key={product.id}
                            style={{
                                margin: "10px",
                                border: "1px solid gray",
                                padding: "10px",
                                width: "250px"
                            }}
                        >

                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                    width: "150px",
                                    height: "150px"
                                }}
                            />

                            <h3>{product.name}</h3>

                            <p>
                                {product.description}
                            </p>

                            <p>
                                Price: ₹{product.price}
                            </p>

                            <p>
                                Stock: {product.stock}
                            </p>

                            <button
                                onClick={() =>
                                    handleEditProduct(product)
                                }
                            >
                                Edit
                            </button>

                            <button
                                onClick={() =>
                                    handleDeleteProduct(product.id)
                                }
                            >
                                Delete
                            </button>

                        </div>

                    ))
                )}

            </div>

        </div>
    );
};

export default AdminProducts;