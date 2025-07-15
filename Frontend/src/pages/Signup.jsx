import React, { useContext, useState } from "react";
import { UserContext } from '../UserContext';
import { useNavigate } from "react-router-dom";
export default function Signup() {
  const { setEmail, setPassword, setRole } = useContext(UserContext);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [error, setError] = useState("");
 const navigate = useNavigate();
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formEmail,
          password: formPassword,
          role: "buyer" // 👈 default role for signup
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Update context
        setEmail(formEmail);
        setPassword(formPassword);
        setRole("buyer");

        alert("Signup successful as buyer");
        navigate('/Home')
        // Optional: navigate to dashboard
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSignup}>
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

        <button type="submit">Signup</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
