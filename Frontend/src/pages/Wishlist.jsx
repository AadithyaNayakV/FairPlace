import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const { email } = useContext(UserContext);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  // Fetch wishlist items
  async function fetchWishlist() {
    try {
      const res = await fetch('http://localhost:5000/api/getwishlist', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  // Load wishlist on mount
  useEffect(() => {
    if (email) fetchWishlist();
  }, [email]);

  // Delete from wishlist
  async function deleteFromWishlist(id) {
    const res = await fetch('http://localhost:5000/api/deleteWishlistItem', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, id }),
    });

    if (res.ok) {
      alert("Item removed from wishlist");
      fetchWishlist(); // refresh
    } else {
      alert("Failed to remove item");
    }
  }

  return (
    <div>
      <h1>Your Wishlist</h1>

      {data.length === 0 ? (
        <p>No items found.</p>
      ) : (
        data.map((prod, idx) => (
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

            <button onClick={() => deleteFromWishlist(prod.id)}>Remove</button>
          </div>
        ))
      )}
    </div>
  );
}
