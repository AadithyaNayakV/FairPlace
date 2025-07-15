import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";


export default function Home() {
  const navigate = useNavigate();
  const { email } = useContext(UserContext);
  const [product, setProduct] = useState([]);

  async function changerole() {
    const res = await fetch("http://localhost:5000/api/changerole", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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

  return (
    <div>
      <button onClick={changerole}>Sell Your Product</button>
      <button onClick={()=>navigate('/myprofile')}>Profile</button>
      <button onClick={()=>navigate('/search')}>Search Product</button>

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
