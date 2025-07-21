import React, { useContext, useState,useEffect } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

export default function ProForm() {
  const { email } = useContext(UserContext); // only for UI; not sent
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  async function handleUpload(e) {
    e.preventDefault();
    if (!image) {
      alert("Select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("image", image); // field name MUST be 'image'

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // send JWT cookie
      });
      const data = await res.json();
      if (res.ok) {
        alert("Product uploaded!");
        console.log("Saved product:", data.product);
        navigate("/myprofile");
      } else {
        console.error("Upload failed:", data);
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error.");
    }
  }
  const [emaill, setemail] = useState(null);
    useEffect(() => {
      async function fetchEmail() {
        const res = await fetch("http://localhost:5000/api/getemail", {
          method: "GET",
          credentials: "include",
        });
  
        if (res.ok) {
          const data = await res.json();
          setemail(data.email);
        } else {
           alert('login is needed')
          navigate('/')
          setemail(null);
        }
      }
      fetchEmail();
    }, []);

   return (
  <div>
    {emaill ? (
      <div>
        <h4>Logged in as: {emaill}</h4>

        <form onSubmit={handleUpload} encType="multipart/form-data">
          <h2>Upload Product</h2>

          <label>
            Title:
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <br />

          <label>
            Price:
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>
          <br />

          <label>
            Description:
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <br />

          <label>
            Category:
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
          <br />

          <label>
            Image:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </label>
          <br />

          <button type="submit">Add Product</button>
        </form>
      </div>
    ) : (
      <h3>Login required</h3>
    )}
  </div>
);}
