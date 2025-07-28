import React, { useContext, useEffect, useState,useRef } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

export default function Myprofile() {
  const { email } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);
  const [emaill, setEmail] = useState(null);
  const navigate = useNavigate();

  // Fetch user's products
  async function personal() {
    try {
      const res = await fetch("http://localhost:5000/api/personal", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        setData(data);
      } else {
        console.error("Error fetching personal data");
      }
    } catch (err) {
      console.error("Server error:", err);
    }
  }




  const hasAlerted = useRef(false);
  // Fetch user email
  useEffect(() => {
    async function fetchEmail() {
      const res = await fetch("http://localhost:5000/api/getemail", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setEmail(data.email);
      } else {
        
        setEmail(null);
        if (!hasAlerted.current) {
            hasAlerted.current = true;
            alert("Login is needed");
            navigate("/");
          }
      }
    }
    fetchEmail();
    personal();
  }, [navigate]);

  // Delete product
  async function deletePro(id) {
    const res1 = await fetch("http://localhost:5000/api/deleteProduct", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res1.ok) {
      alert("Item Deleted Successfully");
      personal(); // re-fetch product list
    } else {
      alert("Item Not deleted");
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {emaill ? (
        <div className="p-6 max-w-6xl mx-auto">
          <h4 className="mb-4 text-center text-lg font-semibold">
          
          </h4>
         <div className="flex justify-between"> <h1 className="text-2xl font-bold text-center mb-7">
            Your Uploaded Products
          </h1> <button className="rounded-lg bg-red-600 hover:bg-red-800 text-white text-sm leading-none h-8 px-4 py-1"
    onClick={() => navigate(-1)}>Back</button></div>

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.length === 0 ? (
              <p className="text-center col-span-full">No products found.</p>
            ) : (
              data.map((prod, idx) => (
                <div
                  key={idx}
                  className="border p-4 rounded-lg shadow hover:scale-105 hover:shadow-xl transition"
                >
                  <h2 className="text-lg font-semibold">{prod.title}</h2>
                  <p className="text-gray-600 text-sm">{prod.description}</p>
                  <p className="text-sm">Category: {prod.category}</p>
                  <p className="font-bold text-sm">Price: ₹{prod.price}</p>

                  <div className="flex justify-center my-2">
                    <img
                      src={prod.image_url}
                      alt={prod.title}
                      className="max-w-full max-h-40 object-cover rounded cursor-pointer"
                      onClick={() => setPreviewImg(prod.image_url)}
                    />
                  </div>

                  <button
                    onClick={() => deletePro(prod.id)}
                    className="bg-red-600 text-white w-full py-1 mt-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>

          {/* PREVIEW IMAGE MODAL */}
          {previewImg && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
              onClick={() => setPreviewImg(null)}
            >
              <img
                src={previewImg}
                className="max-h-[90%] max-w-[90%] rounded-lg shadow-xl transition-transform transform scale-100 hover:scale-105"
                alt="Preview"
              />
            </div>
          )}

          {/* CART BUTTON */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/wishlist")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Your Cart
            </button>
          </div>
        </div>
      ) : (
        <h4 className="text-center mt-10">Login is needed</h4>
      )}
    </div>
  );
}
