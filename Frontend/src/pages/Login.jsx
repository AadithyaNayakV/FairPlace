import React, { useContext, useState } from "react";
import { UserContext } from '../UserContext';
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { setEmail, setPassword, setRole } = useContext(UserContext);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [error, setError] = useState("");
    const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault(); // prevent form reload

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formEmail,
          password: formPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Assume backend sends back role
        setEmail(formEmail);
        setPassword(formPassword);
        setRole(data.role); // e.g., 'buyer' or 'seller'
        //  localStorage.setItem("token", data.token); // ✅ save token
        alert("Login successful as " + data.role);
        navigate('/Home')
        // Redirect or show dashboard if needed
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <label>
          Email:
          <input
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
          />
        </label>
        <br />

        <label>
          Password:
          <input
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            required
          />
        </label>
        <br />

        <button type="submit">Login</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form><button onClick={()=>navigate('/signup')}>Signup</button>
    </div>
  );
}
