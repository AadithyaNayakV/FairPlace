import React, { useContext, useState,useEffect,useRef } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
 
    const hasAlerted = useRef(false);
   // ✅ Authentication Check
     useEffect(() => {
     async function fetchEmail() {
       try {
         const res = await fetch("http://localhost:5000/api/getemail", {
           method: "GET",
           credentials: "include",
         });
 
         if (res.ok) {
           const data = await res.json();
           setemail(data.email);
         } else {
           setemail(null);
           if (!hasAlerted.current) {
             hasAlerted.current = true;
             alert("Login is needed");
             navigate("/");
           }
         }
       } catch (err) {
         console.error("Error fetching email:", err);
         setemail(null);
         if (!hasAlerted.current) {
           hasAlerted.current = true;
           alert("Login is needed");
           navigate("/");
         }
       }
     }
 
     fetchEmail();
   }, [navigate]);

   return (
  <div className="bg-white min-h-screen flex justify-center items-center">
    {emaill ? (
      <div className="w-full max-w-lg bg-gray-100 shadow-2xl p-6 border rounded-2xl m-10">
        <h4 className="mb-4 text-center text-lg font-semibold">
          Logged in as: {emaill}
        </h4>

        <form
          onSubmit={handleUpload}
          className="flex flex-col gap-4 w-full"
          encType="multipart/form-data"
        >
          <h2 className="text-xl font-bold text-center mb-4">
            Upload Product
          </h2>

          <Label className="font-semibold">Title:</Label>
          <Input
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Label className="font-semibold">Price:</Label>
          <Input
            className="w-full border p-2 rounded"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <Label className="font-semibold">Description:</Label>
          <Input
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
         <Label className="font-semibold">Category:</Label>
<select
  name="category"
  id="category"
  className="w-full border p-2 rounded"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="">Select a category</option>
  <option value="Electronics">Electronics</option>
  <option value="Clothing">Clothing</option>
  <option value="Furniture">Furniture</option>
  <option value="Books">Books</option>
  <option value="Toys">Toys</option>
  <option value="Sports">Sports</option>
  
</select>


          <Label className="font-semibold">Image:</Label>
          <Input
            className="w-full border p-2 rounded  text-red-600"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mt-4"
          >
            Add Product
          </button>
        </form>
      </div>
    ) : (
      <h3>Login required</h3>
    )}
  </div>
);
}