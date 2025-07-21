const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("./db");
const authMiddleware = require("./verifyToken");
require("dotenv").config();

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { email, password,role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3)",
      [email, hashedPassword, role]
    );

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
 res.cookie("token", token, {
    httpOnly: true, // ✅ secure from JS access
    sameSite: "Lax", // or "None" if cross-site
    secure: false, // true if using HTTPS
   
  });
  console.log("sjdsjdndnd",email);
    res.json({ message: "Signup success", token, role: "buyer" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
     res.cookie("token", token, {
    httpOnly: true, // ✅ secure from JS access
    sameSite: "Lax", // or "None" if cross-site
    secure: false, // true if using HTTPS
    
  });

    res.json({ message: "Login success", token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});


router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false // use true in production with HTTPS
  });

  res.json({ message: "Logged out successfully" });
});

router.get("/getemail", authMiddleware, async (req, res) => {
  try {
    console.log("jai")
    const email = req.user?.email;

    if (!email) {
      console.log('hi')
      return res.status(404).json({ error: "Email not found" });
    }

    return res.json({ email });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Unauthorized" });
  }
});


module.exports = router;
