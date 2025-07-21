import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

export default function Myprofile() {
  const { email } = useContext(UserContext);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  
 
  //  useEffect(() => {
  //   if (!email ) {
  //     alert("Please log in first.");
  //     navigate("/");
  //   }
  // }, [email]);

  // Fetch user's products
  async function personal() {
    try {
      const res = await fetch('http://localhost:5000/api/personal', {
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
        console.error("Error fetching personal data");
      }
    } catch (err) {
      console.error("Server error:", err);
    }
  }

  // Fetch data on load
  useEffect(() => {
     personal();
  }, []);

  // Delete product
  async function deletePro(id) {
    const res1 = await fetch('http://localhost:5000/api/deleteProduct', {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (res1.ok) {
      alert("Item Deleted Successfully");
      personal(); // re-fetch product list
    } else {
      alert("Item Not deleted");
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
         alert('login is needed')
        navigate('/')
        setemail(null);
      }
    }
    fetchEmail();
  }, []);
  return (
    <div>
       {emaill ? <div><h4>Logged in as: {emaill}</h4>
      <h1>Your Uploaded Products</h1>

      {data.length === 0 ? (
        <p>No products found.</p>
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

            <button onClick={() => deletePro(prod.id)}>Delete</button>
          </div>
        ))
      )}
      
      <button onClick={() => navigate('/wishlist')}>Your Cart</button></div> : <h4>Login is needed</h4>}
    </div>
  );
}
