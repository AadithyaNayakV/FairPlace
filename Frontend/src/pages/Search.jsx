import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function Search() {
  const navigate = useNavigate();
  const { email } = useContext(UserContext);
  const [product, setProduct] = useState([]);
  const [title, setTitle] = useState("");
  const [previewImg, setPreviewImg] = useState(null);

  // Fetch product
  async function getProduct() {
    if (!title.trim()) {
      alert("Please enter a product title.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/getSearchedproduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        if (data.length === 0) alert("No product found");
      } else {
        console.error("Search failed");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  function handleSingleProduct(seller_email) {
    navigate("/seller", { state: { email: seller_email } });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 p-4">
        <label className="w-full sm:w-auto flex flex-col sm:flex-row items-center">
          <span className="font-medium text-gray-700 mr-2">Enter the Title:</span>
          <input
            className="border p-2 rounded-2xl w-full sm:w-64 focus:ring-2 focus:ring-green-400 focus:outline-none"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <button
          className="bg-green-500 hover:bg-green-600 text-white rounded-2xl py-2 px-5 transition duration-300 shadow-md"
          onClick={getProduct}
        >
          Search
        </button>
      </div>

      {/* Products Grid */}
      {product.length === 0 ? (
        <h3 className="text-center text-gray-600 mt-10 text-lg">
          No products found. Try searching for something .
        </h3>
      ) : (
        <div className="p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {product.map((prod, idx) => (
            <div
              key={idx}
              className="border p-4 rounded-lg shadow hover:scale-105 hover:z-20 hover:shadow-2xl bg-white transition-transform duration-300"
            >
              <h2 className="text-lg font-semibold">{prod.title}</h2>
              <p className="text-sm text-gray-600">{prod.description}</p>
              <p className="text-sm">Category: {prod.category}</p>
              <p className="text-sm font-bold">Price: ₹{prod.price}</p>

              <div className="flex justify-center my-2">
                <img
                  src={prod.image_url}
                  alt={prod.title}
                  className="max-w-full max-h-40 object-cover rounded cursor-pointer"
                  onClick={() => setPreviewImg(prod.image_url)}
                />
              </div>

              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 mt-3 transition"
                onClick={() => handleSingleProduct(prod.seller_email)}
              >
                View All Products by this Seller
              </button>
            </div>
          ))}
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
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
    </div>
  );
}
