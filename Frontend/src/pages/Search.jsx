import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";


export default function Search() {
  const navigate = useNavigate();
  const { email } = useContext(UserContext);
  const [product, setProduct] = useState([]);
  const [title, settitle] = useState("");

  async function getproduct() {
    const res = await fetch("http://localhost:5000/api/getSearchedproduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (res.ok) {
      const data = await res.json();
      setProduct(data);
    } else {
      console.error("Search failed");
    }
  }

  function handleSingleProduct(seller_email) {
    navigate("/seller", { state: { email: seller_email } });
  }

  return (
    <div>
      <label>
        Enter the Title:
        <input
          type="text"
          value={title}
          onChange={(e) => settitle(e.target.value)}
        />
      </label>
      <button onClick={getproduct}>Search</button>

      {product.map((prod, idx) => (
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

          <button onClick={() => handleSingleProduct(prod.seller_email)}>
            View All Products by this Seller
          </button>
        </div>
      ))}
    </div>
  );
}
