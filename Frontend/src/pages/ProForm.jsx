import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function ProForm() {
const {email}=useContext(UserContext)
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const navigate=useNavigate()
  async function handleUpload(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("image", image); // image is a File object
    formData.append("email", email); 

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData, // Don't set headers manually
      });

      if (res.ok) {
        alert("Product uploaded successfully!");
        navigate('/myprofile');
        
      } else {
        alert("Upload failed");
        navigate('/home');
      }
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Something went wrong");
    }
  }

  return (
    <div>
      <form onSubmit={handleUpload}>
        <label>
          Title:
          <input value={title} onChange={(e) => setTitle(e.target.value)} name="title" required />
        </label>
        <br />

        <label>
          Price:
          <input value={price} onChange={(e) => setPrice(e.target.value)} name="price" type="number" required />
        </label>
        <br />

        <label>
          Description:
          <input value={description} onChange={(e) => setDescription(e.target.value)} name="description" required />
        </label>
        <br />

        <label>
          Category:
          <input value={category} onChange={(e) => setCategory(e.target.value)} name="category" required />
        </label>
        <br />

        <label>
          Image:
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
        </label>
        <br />

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}
