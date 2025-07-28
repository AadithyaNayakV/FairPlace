import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { Button } from "@/components/ui/button";

export default function Seller() {
  const location = useLocation();
  const seller_email = location.state?.email; 
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { email } = useContext(UserContext);

  // Redirect if no seller email
  useEffect(() => {
    if (!location.state) {
      navigate("/home");
    }
  }, [location, navigate]);

  // Fetch seller products
  useEffect(() => {
    if (seller_email) {
      getAllProducts();
    }
  }, [seller_email]);

  async function getAllProducts() {
    try {
      const res = await fetch("http://localhost:5000/api/getoneproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: seller_email }),
      });
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching seller's products:", error);
    }
  }

  async function addWishlist(id) {
    const res1 = await fetch("http://localhost:5000/api/addwishlist", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, email }),
    });

    if (res1.ok) {
      alert("Item Added Successfully");
      getAllProducts();
    } else {
      const dataa = await res1.json().catch(() => ({}));
      alert(dataa.message || "Failed to add item to wishlist");
    }
  }
const [previewImg, setPreviewImg] = useState(null); 
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Products by Seller</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <p className="text-center col-span-full">No products found.</p>
        ) : (
          products.map((prod, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition hover:scale-105"
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
                  onClick={()=>setPreviewImg(prod.image_url)}
                />
              </div>

              <p className="text-center mt-3 font-medium">Want to Buy?</p>
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <Button
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() =>
                    navigate("/chat", { state: { email: seller_email } })
                  }
                >
                  Contact Seller
                </Button>

                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => addWishlist(prod.id)}
                >
                  Add to Cart
                </Button>

                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() =>
                    navigate("/review", { state: { id: prod.id ,seller_email:seller_email} })
                  }
                >
                  Review
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
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
