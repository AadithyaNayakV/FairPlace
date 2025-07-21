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
        credentials: "include", // ✅ allows sending/receiving cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formEmail,
          password: formPassword,
          role: "buyer", // default
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmail(formEmail);
        setPassword(formPassword);
        setRole("buyer");

        alert("Signup successful!");
        navigate("/home");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
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
