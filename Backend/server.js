const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const products = require('./products');
const upload = require('./upload.js'); // ✅ typo fix: `uplaod` → `upload`
const auth= require('./auth'); // ✅ typo fix: `uplaod` → `upload`

require('dotenv').config();


// Middleware
app.use(cors({
  origin: "https://fair-place.vercel.app", // ✅ your frontend origin
  credentials: true                // ✅ allow cookies
}));

// app.use(cors({
//   origin: "*"
// }));

// Default route
app.use(express.json()); // ✅ parse JSON bodies
app.use(cookieParser()); // ✅ parse cookies

// Routes
app.use('/api', products);
app.use('/api', upload); 
app.use('/api',auth)


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
