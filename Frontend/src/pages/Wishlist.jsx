import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const { email } = useContext(UserContext);
  const [data, setData] = useState({ items: [] });

  const navigate = useNavigate();
//  useEffect(() => {
//     if (!email || !localStorage.getItem("token")) {
//       alert("Please log in first.");
//       navigate("/");
//     }
//   }, [email]);
  // Fetch wishlist items
  async function fetchWishlist() {
    try {
      const res = await fetch('http://localhost:5000/api/getwishlist', {
        method: "POST",
        credentials: "include",
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
    fetchWishlist();
  }, );

  // Delete from wishlist
  async function deleteFromWishlist(id) {
    const res = await fetch('http://localhost:5000/api/deleteWishlistItem', {
      method: "POST",
      credentials: "include",
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
        alert("login is needed")
        navigate('/')
        setemail(null);
      }
    }
    fetchEmail();
  }, []);
  return (
    <div>
             {emaill ? <h4>Logged in as: {emaill}</h4> : <h4>Login is needed</h4>}

      <h1>Your Wishlist</h1>

      {data.items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        data.items.map((prod, idx) => (
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
