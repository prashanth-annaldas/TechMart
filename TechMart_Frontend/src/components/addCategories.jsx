import { useState } from "react";
import api from "../services/api";

function AdminCategory() {

    const [category, setCategory] = useState({
        name: "",
        description: ""
    });

    const handleChange = (e) => {
        setCategory({
            ...category,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const res = await api.post(
                "/api/admin/categories",
                category
            );

            alert(res.data);

            setCategory({
                name: "",
                description: ""
            });

        }
        catch(error){
            console.log(error);
            alert("Category Creation Failed");
        }
    };

    return (
        <div>

            <h2>Add Category</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="name"
                    placeholder="Category Name"
                    value={category.name}
                    onChange={handleChange}
                /> <br /> <br />

                <textarea
                    name="description"
                    placeholder="Description"
                    value={category.description}
                    onChange={handleChange}
                /> <br /> <br />

                <button type="submit">
                    Add Category
                </button>

            </form>

        </div>
    );
}

export default AdminCategory;