import React, { useContext,useRef, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const { email } = useContext(UserContext);
  const [data, setData] = useState({ items: [] });
  const [emaill, setemail] = useState(null);
  const navigate = useNavigate();

  // Fetch wishlist items
  async function fetchWishlist() {
    try {
      const res = await fetch("http://localhost:5000/api/getwishlist", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        setData(data);
      } else {
        console.error("Error fetching wishlist");
      }
    } catch (err) {
      console.error("Server error:", err);
    }
  }

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Delete from wishlist
  async function deleteFromWishlist(id) {
    const res = await fetch("http://localhost:5000/api/deleteWishlistItem", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, id }),
    });

    if (res.ok) {
      alert("Item removed from wishlist");
      fetchWishlist(); // refresh
    } else {
      alert("Failed to remove item");
    }
  }
  const [previewImg, setPreviewImg] = useState(null); 
  
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
    <div className="min-h-screen bg-white p-6">
      {emaill ? (
        <>
          <h4 className="mb-4 text-center text-lg font-semibold">
            
          </h4>
        <div className="flex justify-between"> <h1 className="text-2xl font-bold text-center mb-7">
            Your Wishlist
          </h1><button className="rounded-lg bg-red-600 hover:bg-red-800 text-white text-sm leading-none h-8 px-4 py-1"
    onClick={() => navigate(-1)}>Back</button></div>
        </>
      ) : (
        <h4 className="text-center">Login is needed</h4>
      )}

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.length === 0 ? (
          <p className="text-center col-span-full">No items found.</p>
        ) : (
          data.items.map((prod, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{prod.title}</h2>
              <p className="text-gray-600 text-sm">{prod.description}</p>
              <p className="text-sm">Category: {prod.category}</p>
              <p className="text-sm font-bold">Price: ₹{prod.price}</p>

              <div className="flex justify-center my-2">
                <img
                  src={prod.image_url}
                  alt={prod.title}
                  className="max-w-full max-h-40 object-cover rounded"
                 onClick={() => setPreviewImg(prod.image_url)}
                />
              </div>

              <button
                className="bg-red-600 text-white w-full py-2 rounded hover:bg-red-700"
                onClick={() => deleteFromWishlist(prod.id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>  {previewImg && (
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
    </div>
  );
}
