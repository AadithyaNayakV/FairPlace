import React, { useEffect, useState,useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { Button } from "@/components/ui/button"
export default function Seller() {
  const location = useLocation();
  const seller_email = location.state?.email; // 🛑 make sure it's passed correctly
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (seller_email) {
      getAllProducts();
    }
  }, [seller_email]);

 useEffect(() => {
    if (!location.state) {
      navigate("/home"); // redirect to home
    }
  }, [location, navigate]);

  async function getAllProducts() {
    

    
    try {
      const res = await fetch("http://localhost:5000/api/getoneproduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: seller_email,
        }),
      });

      const data = await res.json();
      setProducts(data); // ✅ store in state
    } catch (error) {
      console.error("Error fetching seller's products:", error);
    }
  }
   const { email } = useContext(UserContext);
async function addWishlist(id){

 const res1 = await fetch('http://localhost:5000/api/addwishlist', {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",

      },
      body: JSON.stringify({ id,email }),
    });

    if (res1.ok) {
      alert("Item Added Successfully");
      getAllProducts()
      
    } else {
    const dataa = await res1.json().catch(() => ({})); // Prevent JSON parse errors
    alert(dataa.message || "Failed to add item to wishlist");
    }
}

  return (
    <div>
      <h1>Products by Seller</h1>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        products.map((prod, idx) => (
          <div key={idx} className="product-card">
            <h2>{prod.title}</h2>
            <p>{prod.description}</p>
            <p>Category: {prod.category}</p>
            <p>Price: ₹{prod.price}</p>

            <div className="grid-container">
              <img
                src={prod.image_url}
                alt={prod.title}
                className="grid-item"
                style={{ maxWidth: "200px" }}
              />
            </div>

            <label>Want to Buy?</label>
            <Button varient="ghost" onClick={()=>navigate('/chat',{state:{email:seller_email}})}>Contact the Seller</Button>

            <button className="flex min-h-svh flex-col items-center justify-center" onClick={()=>addWishlist(prod.id)}>Add to Cart</button>
            <button onClick={()=>navigate('/review',{ state: { id: prod.id } })}>review</button>
              
           
          </div>
        ))
      )}
    </div>
  );
}
