import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Robot() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3);
    camera.position.z=5 

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load('/chatbot_v011.glb', (gltf) => {
      const model = gltf.scene;
      model.scale.set(10, 10, 10);
      model.position.set(0, -1, 0);
      scene.add(model);
    }, undefined, (error) => {
      console.error("Model load error:", error);
    });
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
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enableDamping = true;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
    };
  }, []);
  const navigate=useNavigate()
const [text,sett]=useState(false)
useEffect(()=>{
setInterval(sett(true),3000)
},[])
 return (
  <div className="relative z-10 flex flex-col justify-between items-center min-h-screen pt-16 pb-10">
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    />

    {/* Spacer (can be used to align canvas top content) */}
<div className="h-12"></div>
    
    {text && (
      <button
        className="border border-white rounded-2xl text-white px-6 py-2 bg-black bg-opacity-50 hover:bg-opacity-70 transition hover:bg-white hover:text-black"
        onClick={() => navigate('/chatbot')}
      >
        Continue
      </button>
    )}
  </div>
);
}