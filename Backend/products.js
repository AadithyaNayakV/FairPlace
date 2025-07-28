const express = require('express');
const router = express.Router();
const pool = require('./db'); 
const app=express()
const {isTextSafe}=require('./hfclient')
const middleware = require('./verifyToken'); 
const authMiddleware = require('./verifyToken');
app.use(express.json()); // ✅ parse JSON bodies
// app.use(cookieParser()); // ✅ parse cookies
const cloudinary = require("./cloudinary");
router.post('/changerole', middleware, async (req, res) => {
  const { email } = req.body;
   const email1 = req.user.email;
  

  // if (email !== email1) {
  //   return res.status(403).json({ message: 'Unauthorized access' });
  // }
console.log(email)
console.log(email1)
//   if (email !== email1) {
//     return res.status(403).json({ message: 'Unauthorized access' });
//   }

  try {
    await pool.query(
      "UPDATE users SET role = $1 WHERE email = $2",
      ["seller", email1]
    );

    return res.json({ message: 'Role updated to seller successfully' });
  } catch (err) {
    console.error("Error updating role:", err);
    return res.status(500).json({ message: 'Error' });
  }
});


router.get('/getallproduct', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows); // just send the rows directly
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});
router.post('/getoneproduct', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE seller_email = $1',
      [email]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});
router.post('/addWishlist', authMiddleware, async (req, res) => {
  const { id } = req.body;
  const userEmail = req.user.email;
  if(!userEmail)
    {return res.status(404).json({ message: 'login needed' });
  }


  if (!id) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    await pool.query(
      'INSERT INTO wishlist (user_email, product_id) VALUES ($1, $2)',
      [userEmail, id]
    );

    return res.status(201).json({ message: 'Added to wishlist' });
  } catch (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      return res.status(409).json({ message: 'Item already in wishlist' });
    }
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({ message: 'Failed to add to wishlist' });
  }
});



router.post('/personal',authMiddleware,async(req,res)=>{
   const {  email } = req.body;
  const email1 = req.user.email;

  // if (email !== email1) {
  //   return res.status(403).json({ message: 'Unauthorized access' });
  // }
   try {
    const result = await pool.query(
      'SELECT * FROM products WHERE seller_email = $1',
      [email1]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});router.post('/deleteProduct', authMiddleware, async (req, res) => {
  const { id } = req.body;
  const userEmail = req.user.email;

  try {
    // ✅ 1. Check if product belongs to the user
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND seller_email = $2',
      [id, userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or product not found' });
    }

    const productRow = result.rows[0];

    // ✅ 2. Delete from Cloudinary if image exists
    if (productRow.image_public_id) {
      await cloudinary.uploader.destroy(productRow.image_public_id);
      console.log(`✅ Deleted image from Cloudinary: ${productRow.image_public_id}`);
    }

    // ✅ 3. Delete from DB
    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ message: 'Delete failed' });
  }
});


router.post('/getSearchedProduct', async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    // ILIKE for case-insensitive match, % for partial match
    const result = await pool.query(
      'SELECT * FROM products WHERE title ILIKE $1',
      [`%${title}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});
router.post('/getwishlist', authMiddleware, async (req, res) => {
  const email = req.user.email;

  try {
    // 1. Fetch wishlist items for user
    const wishlistResult = await pool.query(
      'SELECT product_id FROM wishlist WHERE user_email = $1',
      [email]
    );

    if (wishlistResult.rows.length === 0) {
      return res.json({ message: 'Wishlist is empty', items: [] });
    }

    // 2. Extract product IDs into an array
    const productIds = wishlistResult.rows.map(row => row.product_id);

    // 3. Fetch products for these IDs
    const productsResult = await pool.query(
      'SELECT * FROM products WHERE id = ANY($1)',
      [productIds]
    );

    res.json({ message: 'Wishlist fetched', items: productsResult.rows });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});router.post('/deleteWishlistItem', authMiddleware, async (req, res) => {
  const { id } = req.body;
  const userEmail = req.user.email;

  try {
    const result = await pool.query(
      'DELETE FROM wishlist WHERE product_id = $1 AND user_email = $2 RETURNING *',
      [id, userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or item not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ message: 'Delete failed' });
  }
});

router.post('/getreview', async (req, res) => {
  const { id } = req.body; // product_id
  try {
    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const result = await pool.query('SELECT * FROM reviews WHERE product_id = $1', [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No reviews found' });
    }

    res.json(result.rows); // send all reviews as array
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});router.post('/sendreview',authMiddleware, async (req, res) => {
  const { id, text } = req.body;
  const email=req.user.email
  
  const check = await isTextSafe(text);

  if (!check.ok) {
    // blocked
    return res.status(403).json({
      allowed: false,
      decision: check.decision, // "REJECT" or "ERROR"
      message: "Message blocked due to toxicity."
    });
  }
  if(check.ok)
console.log("check passed")
  try {
    await pool.query(
      'INSERT INTO reviews (product_id, reviewer_email, comment) VALUES ($1, $2, $3)',
      [id, email, text]
    );
    res.status(201).json({ message: 'Review added successfully' });
  } catch (err) {
    if (err.code === '23505') { // Duplicate key error
      
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});





// // ✅ Send a message
// router.post("/sendMessage", authMiddleware, async (req, res) => {
//   try {
//     const senderEmail = req.user.email;
//     const { receiver_email, content } = req.body;

//     if (!receiver_email || !content) {
//       return res.status(400).json({ error: "Receiver and content required" });
//     }

//     await pool.query(
//       `INSERT INTO messages (sender_email, receiver_email, content)
//        VALUES ($1, $2, $3)`,
//       [senderEmail, receiver_email, content]
//     );

//     return res.status(201).json({ message: "Message sent" });
//   } catch (err) {
//     console.error("Send message error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });router.get("/getMessages", authMiddleware, async (req, res) => {
//   try {
//     const userEmail = req.user.email;
//     const { chat_with_email, onlyUnread } = req.query;

//     if (!chat_with_email) {
//       return res.status(400).json({ error: "chat_with_email is required" });
//     }

//     // Get last read ID
//     const statusResult = await pool.query(
//       `SELECT last_read_message_id 
//        FROM chat_status
//        WHERE user_email = $1 AND chat_with_email = $2`,
//       [userEmail, chat_with_email]
//     );
//     const lastReadId = statusResult.rows[0]?.last_read_message_id || 0;

//     // Build query
//     let sql = `
//       SELECT id, sender_email, receiver_email, content, timestamp
//       FROM messages
//       WHERE ((sender_email = $1 AND receiver_email = $2)
//          OR (sender_email = $2 AND receiver_email = $1))`;
//     const params = [userEmail, chat_with_email];

//     if (onlyUnread === "true") {
//       sql += ` AND id > $3`;
//       params.push(lastReadId);
//     }

//     sql += ` ORDER BY id ASC`;

//     const result = await pool.query(sql, params);

//     // Update last_read_message_id if we fetched anything
//     if (result.rows.length > 0) {
//       const latestId = result.rows[result.rows.length - 1].id;
//       await pool.query(
//         `INSERT INTO chat_status (user_email, chat_with_email, last_read_message_id)
//          VALUES ($1, $2, $3)
//          ON CONFLICT (user_email, chat_with_email)
//          DO UPDATE SET last_read_message_id = EXCLUDED.last_read_message_id`,
//         [userEmail, chat_with_email, latestId]
//       );
//     }

//     return res.json(result.rows);
//   } catch (err) {
//     console.error("Get messages error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });


router.post("/sendmsg", authMiddleware, async (req, res) => {
  try {
    const sender = req.user.email;
    const { receiver, text } = req.body;
    if (!receiver || !text) {
      return res.status(400).json({ error: "receiver and text required" });
    }

    await pool.query(
      `INSERT INTO messages (sender_email, receiver_email, content)
       VALUES ($1, $2, $3)`,
      [sender, receiver, text]
    );

    // ensure chat_status rows exist
    await pool.query(`
      INSERT INTO chat_status (user_email, chat_with_email)
      VALUES ($1, $2) ON CONFLICT DO NOTHING
    `, [sender, receiver]);

    await pool.query(`
      INSERT INTO chat_status (user_email, chat_with_email)
      VALUES ($1, $2) ON CONFLICT DO NOTHING
    `, [receiver, sender]);

    //  await pool.query(`
    //   DELETE FROM messages m
    //   WHERE EXISTS (
    //     SELECT 1 FROM chat_status a
    //     JOIN chat_status b
    //       ON a.chat_with_email = b.user_email 
    //      AND b.chat_with_email = a.user_email
    //     WHERE 
    //       (
    //         (a.user_email = m.sender_email AND b.user_email = m.receiver_email)
    //         OR
    //         (a.user_email = m.receiver_email AND b.user_email = m.sender_email)
    //       )
    //       AND m.id <= LEAST(a.last_read_message_id, b.last_read_message_id)
    //   )
    // `);

    res.json({ success: true });
  } catch (err) {
    console.error("sendmsg:", err);
    res.status(500).json({ error: "server error" });
  }
});

/* ------------------------------------------
   GET ALL MESSAGES (marks read)
   GET /api/getMessages?chat_with_email=someone
   Returns full history; marks last_read_message_id.
------------------------------------------- */
router.get("/getMessages", authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { chat_with_email } = req.query;
    if (!chat_with_email) {
      return res.status(400).json({ error: "chat_with_email required" });
    }

    const result = await pool.query(
      `SELECT id, sender_email, receiver_email, content, timestamp
       FROM messages
       WHERE (sender_email=$1 AND receiver_email=$2)
          OR (sender_email=$2 AND receiver_email=$1)
       ORDER BY id ASC`,
      [userEmail, chat_with_email]
    );

    // mark read to newest
    if (result.rows.length > 0) {
      const latestId = result.rows[result.rows.length - 1].id;
      await pool.query(`
        INSERT INTO chat_status (user_email, chat_with_email, last_read_message_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_email, chat_with_email)
        DO UPDATE SET last_read_message_id = EXCLUDED.last_read_message_id
      `, [userEmail, chat_with_email, latestId]);
    }
 // ✅ CLEANUP LOGIC HERE
    await pool.query(
      `
      WITH a AS (
        SELECT last_read_message_id FROM chat_status WHERE user_email = $1 AND chat_with_email = $2
      ),
      b AS (
        SELECT last_read_message_id FROM chat_status WHERE user_email = $2 AND chat_with_email = $1
      ),
      cutoff AS (
        SELECT LEAST(a.last_read_message_id, b.last_read_message_id) AS both_read_upto
        FROM a, b
      )
      DELETE FROM messages m
      USING cutoff c
      WHERE c.both_read_upto IS NOT NULL
        AND (
              (m.sender_email = $1 AND m.receiver_email = $2)
           OR (m.sender_email = $2 AND m.receiver_email = $1)
            )
        AND m.id <= c.both_read_upto
        AND EXISTS (
            SELECT 1 FROM messages m2
            WHERE (
              (m2.sender_email = $1 AND m2.receiver_email = $2)
              OR (m2.sender_email = $2 AND m2.receiver_email = $1)
            )
            AND m2.id > c.both_read_upto
        );
      `,
      [userEmail, chat_with_email]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getMessages:", err);
    res.status(500).json({ error: "server error" });
  }
});

/* ------------------------------------------
   GET UNREAD (does NOT mark read)
   GET /api/getUnreadMessages?chat_with_email=someone
------------------------------------------- */
router.get("/getUnreadMessages", authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { chat_with_email } = req.query;
    if (!chat_with_email) {
      return res.status(400).json({ error: "chat_with_email required" });
    }

    const status = await pool.query(
      `SELECT last_read_message_id FROM chat_status
       WHERE user_email=$1 AND chat_with_email=$2`,
      [userEmail, chat_with_email]
    );
    const lastRead = status.rows[0]?.last_read_message_id || 0;

    const result = await pool.query(
      `SELECT id, sender_email, receiver_email, content, timestamp
       FROM messages
       WHERE ((sender_email=$1 AND receiver_email=$2)
          OR (sender_email=$2 AND receiver_email=$1))
         AND id > $3
       ORDER BY id ASC`,
      [userEmail, chat_with_email, lastRead]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getUnreadMessages:", err);
    res.status(500).json({ error: "server error" });
  }
});

/* ------------------------------------------
   CHATLIST (all users you've chatted with)
   GET /api/chatlist
------------------------------------------- */


// GET /api/chatlist
router.get('/chatlist', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;

    const query = `
      SELECT DISTINCT CASE 
        WHEN sender_email = $1 THEN receiver_email 
        ELSE sender_email END AS chat_with
      FROM messages
      WHERE sender_email = $1 OR receiver_email = $1;
    `;
    const { rows } = await pool.query(query, [userEmail]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete("/cleanup-read-messages", async (req, res) => {
  try {
    const query = `
      DELETE FROM messages m
      WHERE EXISTS (
        SELECT 1 FROM chat_status a
        JOIN chat_status b
          ON a.chat_with_email = b.user_email 
         AND b.chat_with_email = a.user_email
        WHERE 
          (
            (a.user_email = m.sender_email AND b.user_email = m.receiver_email)
            OR
            (a.user_email = m.receiver_email AND b.user_email = m.sender_email)
          )
          AND m.id <= LEAST(a.last_read_message_id, b.last_read_message_id)
      )
    `;
    const result = await pool.query(query);
    res.json({ deleted: result.rowCount });
  } catch (err) {
    console.error("❌ Manual cleanup error:", err);
    res.status(500).json({ error: "Failed to delete messages" });
  }
});

// --- Gemini SDK ---
// The @google/generative-ai package supports CommonJS via require in recent versions.
// If you see errors ("ERR_REQUIRE_ESM"), use the fallback dynamic import shown below.
let GoogleGenerativeAI;
try {
  ({ GoogleGenerativeAI } = require("@google/generative-ai"));
} catch (err) {
  console.warn("Falling back to dynamic import for @google/generative-ai:", err.message);
}
const rateLimit = require("express-rate-limit").default || require("express-rate-limit"); 

// ✅ Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Rate limiter (20 messages per IP per day)
const chatLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  message: { error: "You have reached the daily limit of 20 messages." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Chatbot route
router.post("/chatbot", chatLimiter,authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);

    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
