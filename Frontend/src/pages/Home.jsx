import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";


export default function Home() {
  const { setEmail, setPassword, setRole } = useContext(UserContext);
  const navigate = useNavigate();
  const {email} = useContext(UserContext);
  
  const [product, setProduct] = useState([]);
// const token = localStorage.getItem("token");
  async function changerole() {
    const res = await fetch(`http://localhost:5000/api/changerole`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
         
      },
      body: JSON.stringify({email}),

    });
   

    if (res.ok) {
      navigate("/ProForm");
    } else {
     
      alert("Some problem occurred");
    }
  }


  async function getproduct() {
    const res1 = await fetch("http://localhost:5000/api/getallproduct", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res1.ok) {
      const data = await res1.json(); // ✅ fixed
      setProduct(data);
    }
  }

  useEffect(() => {
    getproduct();
  }, []);

  // 🔥 Get single seller's products
  function handleSingleProduct(seller_email) {
   
   navigate("/seller", { state: { email: seller_email } }); // ✅ send data to /seller route
  }

  async function handleLogout() {
    try {
      const res = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include" // ✅ must include to clear cookie
      });

      if (res.ok) {
        // Clear context values
        setEmail("");
        setPassword("");
        setRole("buyer");

        alert("Logged out successfully");
        navigate("/");
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Something went wrong");
    }
  }
  return (
    <div>
      <button onClick={changerole}>Sell Your Product</button><br/>
      <button onClick={()=>navigate('/myprofile')}>Profile</button><br/>
      <button onClick={()=>navigate('/search')}>Search Product</button><br/>
      <button onClick={()=>navigate('/chatlist')}>Chats</button><br/>
      <button onClick={()=>navigate('/chatbot')}>Chatbot</button><br/>
     <button onClick={handleLogout}>Logout</button><br />

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
