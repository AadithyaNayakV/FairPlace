// // upload.js
// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// const verifyToken = require("./verifyToken");
// const cloudinary = require("./cloudinary");
// const pool = require("./db");

// // temp upload dir
// const upload = multer({ dest: "uploads/" });

// /**
//  * POST /api/upload
//  * multipart/form-data:
//  *   image        (file, required)
//  *   title        (string, required)
//  *   price        (number/string, required)
//  *   description  (string, optional)
//  *   category     (string, optional)
//  *
//  * seller_email comes from JWT (req.user.email)
//  * 
//  */



// const express = require("express");
// const multer = require("multer");
// const fetch = require("node-fetch");
// require("dotenv").config();

// const HF_TOKEN = process.env.HF_TOKEN;
// // const router = express.Router();
// // const upload = multer({ storage: multer.memoryStorage() });

// // --- Hugging Face API Calls ---
// async function hfCheckNSFW(imageBuffer) {
//   const res = await fetch(
//     "https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection",
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${HF_TOKEN}`,
//         "Content-Type": "application/octet-stream",
//       },
//       body: imageBuffer,
//     }
//   );
//   if (!res.ok) throw new Error("NSFW API error");
//   const data = await res.json();
//   const scores = {};
//   for (const r of data) scores[r.label.toUpperCase()] = r.score;
//   const nsfwScore =
//     (scores.PORN || 0) + (scores.SEXY || 0) + (scores.HENTAI || 0);
//   return nsfwScore > 0.30;
// }

// async function hfCheckIsProduct(imageBuffer) {
//   const labels = [
//     "product photo",
//     "person selfie",
//     "scenery",
//     "document scan",
//     "random image",
//   ];

//   const res = await fetch(
//     "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${HF_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         inputs: {
//           image: imageBuffer.toString("base64"),
//           text: labels,
//         },
//       }),
//     }
//   );
//   if (!res.ok) throw new Error("Product check API error");
//   const data = await res.json();
//   const top = data[0];
//   return top.label === "product photo" && top.score >= 0.45;
// }

// // --- Combined Validate Route ---
// router.post("/image/validate", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "Image required" });

//     const imgBuffer = req.file.buffer;

//     const isNSFW = await hfCheckNSFW(imgBuffer);
//     if (isNSFW) {
//       return res.json({ allowed: false, reason: "NSFW content detected" });
//     }

//     const isProduct = await hfCheckIsProduct(imgBuffer);
//     if (!isProduct) {
//       return res.json({ allowed: false, reason: "Not a valid product photo" });
//     }

//     res.json({ allowed: true });
//   } catch (err) {
//     console.error("Image validation error:", err);
//     res.status(500).json({ error: "Validation failed" });
//   }
// });





// router.post("/upload", verifyToken, upload.single("image"), async (req, res) => {
//   const seller_email = req.user?.email;
//   if (!seller_email) {
//     return res.status(401).json({ error: "User email missing in auth context." });
//   }

//   const { title, price, description, category } = req.body;

//   if (!title || !price) {
//     return res.status(400).json({ error: "Missing required fields: title, price." });
//   }

//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded (field name must be 'image')." });
//   }


//   const absPath = path.resolve(req.file.path);
//   const cleanupTemp = () => fs.unlink(absPath, () => {});
// try {
//     if (!req.file) return res.status(400).json({ error: "Image required" });

//     const imgBuffer = req.file.buffer;

//     const isNSFW = await hfCheckNSFW(imgBuffer);
//     if (isNSFW) {
//       return res.status(500).json({ allowed: false, reason: "NSFW content detected" });
//     }

//     const isProduct = await hfCheckIsProduct(imgBuffer);
//     if (!isProduct) {
//       return res.status(500).json({ allowed: false, reason: "Not a valid product photo" });
//     }

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(absPath, {
//       folder: "FairPlace",
//       resource_type: "image",
//     });

//     // Remove temp file regardless of DB success/failure
//     cleanupTemp();

//     const imageUrl = result.secure_url;
//     const publicId = result.public_id;

//     // Insert product in DB (return row)
//     const insertSQL = `
//       INSERT INTO products (seller_email, title, price, description, image_url, image_public_id, category)
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       RETURNING *;
//     `;
//     const values = [
//       seller_email,
//       title,
//       price,                // let PG cast; or Number(price)
//       description || null,
//       imageUrl,
//       publicId,
//       category || null,
//     ];

//     const dbRes = await pool.query(insertSQL, values);
//     const productRow = dbRes.rows[0];

//     return res.json({
//       message: "Product uploaded successfully",
//       product: productRow,
//     });
//   } catch (err) {
//     console.error("Upload error:", err);
//     cleanupTemp(); // in case Cloudinary failed before cleanup
//     return res.status(500).json({ error: "Upload failed", details: err.message });
//   }
// });

// module.exports = router;
const { validateProductImage } = require("./hfProductZeroShot");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const {isTextSafe}=require('./hfclient')

const verifyToken = require("./verifyToken");
const cloudinary = require("./cloudinary");
const pool = require("./db");

const router = express.Router();
const HF_TOKEN = process.env.HF_TOKEN;

// ✅ Multer for temporary upload
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Hugging Face NSFW Detection
async function hfCheckNSFW(imageBuffer) {
  const res = await fetch(
    "https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
      body: imageBuffer,
    }
  );
  if (!res.ok) throw new Error("NSFW API error");
  const data = await res.json();

  const scores = {};
  for (const r of data) scores[r.label.toUpperCase()] = r.score;
  const nsfwScore =
    (scores.PORN || 0) + (scores.SEXY || 0) + (scores.HENTAI || 0);
  return nsfwScore > 0.30; // threshold
}
async function hfCheckIsProduct(imageBuffer) {
  const labels = [
    "product photo",
    "person selfie",
    "scenery",
    "document scan",
    "random image",
  ];

  const res = await fetch(
    "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          image: `data:image/jpeg;base64,${imageBuffer.toString("base64")}`,
          text: labels,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("HF API Error:", errText);
    throw new Error("Product check API error");
  }

  const data = await res.json();
  console.log("HF CLIP Response:", JSON.stringify(data));

  // Get highest scoring label
  let bestLabel = "";
  let bestScore = 0;
  data.forEach((item, i) => {
    if (item.score > bestScore) {
      bestScore = item.score;
      bestLabel = item.label;
    }
  });

  return bestLabel === "product photo" && bestScore >= 0.45;
}

// ✅ Upload Route with Image Validation
router.post("/upload", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const seller_email = req.user?.email;
    if (!seller_email) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const { title, price, description, category } = req.body;

    
    
    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required" });
    }
    
    const check = await isTextSafe(description);
  
    const check1 = await isTextSafe(title);
    if (!check.ok) {
      // blocked
      return res.status(403).json({
        allowed: false,
        decision: check.decision, // "REJECT" or "ERROR"
        message: "blocked due to toxicity in content."
      });
    }
    if(check.ok)
console.log("passsss"

);
if(check1.ok)
console.log("passsss")
  

  if (!check1.ok) {
    // blocked
    return res.status(403).json({
      allowed: false,
      decision: check.decision, // "REJECT" or "ERROR"
      message: "blocked due to toxicity in content."
    });
  }
    
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imgBuffer = req.file.buffer;

const imgResult = await validateProductImage(req.file.buffer, { strict: true });
    if (!imgResult.isProduct) {
      return res.status(400).json({
        allowed: false,
        message: imgResult.rejectReason || "Image failed validation.",
        debug: imgResult.debug?.detRes?.objects?.slice?.(0,5) // optional
      });
    }

    // // ✅ Check NSFW content
    // const isNSFW = await hfCheckNSFW(imgBuffer);
    // if (isNSFW) {
    //   return res
    //     .status(400)
    //     .json({ allowed: false, reason: "NSFW content detected" });
    // }

    // // ✅ Check if it's a product image
    // const isProduct = await hfCheckIsProduct(imgBuffer);
    // if (!isProduct) {
    //   return res
    //     .status(400)
    //     .json({ allowed: false, reason: "Not a valid product photo" });
    // }

    // ✅ Save image temporarily for Cloudinary
    const tempPath = path.join(__dirname, "uploads", `${Date.now()}.jpg`);
    fs.writeFileSync(tempPath, imgBuffer);

    // ✅ Upload to Cloudinary
    const result = await cloudinary.uploader.upload(tempPath, {
      folder: "FairPlace",
      resource_type: "image",
    });

    // ✅ Remove temp file
    fs.unlinkSync(tempPath);

    const imageUrl = result.secure_url;
    const publicId = result.public_id;

    // ✅ Insert product in DB
    const insertSQL = `
      INSERT INTO products (seller_email, title, price, description, image_url, image_public_id, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      seller_email,
      title,
      price,
      description || null,
      imageUrl,
      publicId,
      category || null,
    ];

    const dbRes = await pool.query(insertSQL, values);
    return res.json({
      message: "Product uploaded successfully",
      product: dbRes.rows[0],
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res
      .status(500)
      .json({ error: "Upload failed", details: err.message });
  }
});

module.exports = router;
