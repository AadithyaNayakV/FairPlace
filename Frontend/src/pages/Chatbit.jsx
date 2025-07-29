import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useNavigate } from "react-router-dom";
// import { useRef } from "react";

export default function Chatbot() {
  const canvasRef = useRef(); // 👈 This is how we'll refer to the <canvas>
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emaill, setemail] = useState(null);

  // ✅ 3D Scene Setup
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enablePan = false;

    const light = new THREE.AmbientLight(0xffffff, 2);
    scene.add(light);

    const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
    const planetMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: "red",
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(planet);

    planet.position.set(0, 0, 0);

    // Add stars
    const addStar = () => {
      const geometry = new THREE.SphereGeometry(0.1, 24, 24);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const star = new THREE.Mesh(geometry, material);
      const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(100));
      star.position.set(x, y, z);
      scene.add(star);
    };
    Array(1500).fill().forEach(addStar);

    const animate = () => {
      requestAnimationFrame(animate);
      planet.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);



   const hasAlerted = useRef(false);
  // ✅ Authentication Check
    useEffect(() => {
    async function fetchEmail() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/getemail`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setemail(data.email);
        } else {
          setemail(null);
          if (!hasAlerted.current) {
            hasAlerted.current = true;
            alert("Login is needed");
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Error fetching email:", err);
        setemail(null);
        if (!hasAlerted.current) {
          hasAlerted.current = true;
          alert("Login is needed");
          navigate("/");
        }
      }
    }

    fetchEmail();
  }, [navigate]);
  // ✅ Chat Handling
  const sendMessage = async () => {
    if (!userMessage.trim()) return;
    const newMessages = [...messages, { sender: "user", text: userMessage }];
    setMessages(newMessages);
    setUserMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setMessages([
        ...newMessages,
        { sender: "bot", text: data.reply || data.error || "Error from bot" },
      ]);
    } catch (error) {
      setMessages([...newMessages, { sender: "bot", text: "Server error!" }]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    
   <div className="relative h-screen w-screen overflow-hidden">

  
  <canvas
    ref={canvasRef}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: -1,
      width: "100vw",
      height: "100vh",
    }}
  />


  <div className="flex flex-col justify-between items-center h-full px-4 py-5">

    <div
      className="bg-white rounded-2xl shadow-lg w-full max-w-2xl flex flex-col overflow-y-auto p-6"
      style={{ flex: 1, minHeight: 0 }}
    >
      <h2 className="text-center text-xl font-semibold mb-4 border-1 rounded-2xl bg-red-200">Chatbot</h2>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background: msg.sender === "user" ? "#0078ff" : "#e5e5ea",
              color: msg.sender === "user" ? "#fff" : "#000",
              padding: "10px",
              borderRadius: "12px",
              maxWidth: "70%",
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="italic text-gray-500">Bot is typing...</div>
        )}
      </div>
    </div>

    {/* Input Section */}
    <div className="w-full max-w-2xl flex mt-4 gap-2">
      <input
        className="flex-1 px-4 py-2 border rounded-lg text-base bg-amber-50"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type a message..."
      />
      <button
        className="bg-green-600 text-white px-4 py-2 rounded-lg"
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  </div>
</div>


  );
}
