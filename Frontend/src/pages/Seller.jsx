import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Seller() {
  const location = useLocation();
  const seller_email = location.state?.email; // 🛑 make sure it's passed correctly
  const [products, setProducts] = useState([]);
  const nav = useNavigate();
function contact(){
  
}
  useEffect(() => {
    if (seller_email) {
      getAllProducts();
    }
  }, [seller_email]);

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
async function addWishlist(id){
 const res1 = await fetch('http://localhost:5000/api/addwishlist', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (res1.ok) {
      alert("Item Added Successfully");
      getAllProducts()
      
    } else {
      alert("Item Not Added");
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
            <a href={`mailto:${seller_email}`}>Contact the Seller</a>

            <button onClick={()=>addWishlist(prod.id)}>Add to Cart</button>
              
           
          </div>
        ))
      )}
    </div>
  );
}
