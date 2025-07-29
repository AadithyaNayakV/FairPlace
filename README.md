🌟 FairPlace

FairPlace is a dynamic full-stack web application where multiple sellers can register and post products for sale. Buyers can browse listings, view seller profiles, and connect for purchases. Inspired by digital fairs and community marketplaces, FairPlace makes online selling easier and interactive.


🎯 Features

- 🧑‍💼 Seller Registration & Login  
- 🛒 Add, Edit & Delete Products  
- 🔍 Browse All Sellers & Their Items  
- 📁 Upload Product Images with Cloudinary via Form  
- 📬 Contact Sellers by Chat System  
- 💾 Persistent Data with PostgreSQL  
- 🔐 JWT Authentication with Cookies  
- 🌐 Hosted Frontend (Vercel) & Backend (Render)   
- 🧰 Modern UI using Tailwind CSS  
- 📦 3D Product Model Viewer (GLB Support)

---

🛠️ Tech Stack

 Frontend 🖥️
- React.js
- Vite
- Tailwind CSS
- Three.js (for .glb models)

 Backend 🧠
- Node.js + Express.js
- PostgreSQL
- JWT Authentication
- Cloudinary (for secure image uploads)
- CORS & Cookie support

---

 📂 Folder Structure (Simplified)

FairPlace/
├── Backend/
│ ├── routes/
│ ├── controllers/
│ ├── uploads/ (Cloudinary handles final storage)
│ └── server.js
├── Frontend/
│ ├── public/
│ │ └── chatbot_v011.glb
│ ├── src/
│ │ ├── components/
│ │ └── pages/
│ └── index.html



## 🧪 How It Works

- Sellers can register and log in securely using JWT stored in cookies.
- Products are uploaded with images (via Cloudinary) and displayed instantly.
- Buyers can view seller profiles and all their products.
- A 3D product model (.glb) is loaded from the public folder using Three.js and GLTFLoader.

Hosted Website:
  https://fair-place.vercel.app/
