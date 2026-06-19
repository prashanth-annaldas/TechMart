import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function AddProduct() {
    const { showToast } = useToast();

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [categories, setCategories] = useState([]);

    const loadCategories = async () => {

        try {

            const res = await api.get(
                "/api/categories"
            );

            setCategories(res.data);

        }
        catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

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

            await api.post(
                "/api/admin/products",
                productData
            );

            showToast("Product Added successfully!", "success");

            setName("");
            setPrice("");
            setStock("");
            setDescription("");
            setCategoryId("");
            setImageUrl("");

        }
        catch (error) {
            console.log(error);
            showToast("Product Creation Failed", "error");
        }
    };

    return (
        <div>

            <h2>Add Product</h2>

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
                    placeholder="Paste Image URL"
                    value={imageUrl}
                    onChange={(e) =>
                        setImageUrl(e.target.value)
                    }
                />

                <br /><br />

                <button type="submit">
                    Add Product
                </button>

            </form>

        </div>
    );
}

export default AddProduct;