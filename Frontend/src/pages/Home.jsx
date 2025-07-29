import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { setEmail, setPassword, setRole, email } = useContext(UserContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState([]);
  const [previewImg, setPreviewImg] = useState(null); 

  async function changerole() {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/changerole`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) navigate("/ProForm");
    else alert("Some problem occurred");
  }

  async function getproduct() {
    const res1 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/getallproduct`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (res1.ok) {
      const data = await res1.json();
      setProduct(data);
    }
  }

  useEffect(() => {
    getproduct();
  }, []);

  function handleSingleProduct(seller_email) {
    navigate("/seller", { state: { email: seller_email } });
  }

  async function handleLogout() {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setEmail("");
        setPassword("");
        setRole("buyer");
        alert("Logged out successfully");
        navigate("/");
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Something went wrong");
    }
  }

  const [emaill, setemail] = useState(null);
    useEffect(() => {
      async function fetchEmail() {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/getemail`, {
          method: "GET",
          credentials: "include",
        });
  
        if (res.ok) {
          const data = await res.json();
          setemail(data.email);
        } } fetchEmail()},[])

  return (
    <div className="bg-white min-h-screen">
      {/* NAVBAR */}
      <div className="w-full bg-gray-100 p-4 shadow-md">
  <div className="w-full flex items-center justify-between">
    {/* LEFT - Navigation Links */}
    <NavigationMenu className="flex">
      <NavigationMenuList className="flex flex-wrap gap-6">
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={changerole}
            className="cursor-pointer hover:text-blue-600 text-md font-bold"
          >
            Sell Your Product
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => navigate("/myprofile")}
            className="cursor-pointer hover:text-blue-600 text-md font-bold"
          >
            Profile
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => navigate("/search")}
            className="cursor-pointer hover:text-blue-600 text-md font-bold"
          >
            Search Product
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => navigate("/chatlist")}
            className="cursor-pointer hover:text-blue-600 text-md font-bold"
          >
            Chats
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => navigate("/robot")}
            className="cursor-pointer hover:text-blue-600 text-md font-bold"
          >
            Chatbot
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>

    {/* RIGHT - Buttons */}
    <div className="flex gap-2">
      {emaill ? (
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="hover:bg-red-800"
        >
          Logout
        </Button>
      ) : (
        <Button
          onClick={() => navigate("/")}
          className="bg-green-500 hover:bg-green-800"
        >
          Login
        </Button>
      )}
    </div>
  </div>
</div>

      {/* PRODUCT GRID */}
      <div className="p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {product.map((prod, idx) => (
          <div
            key={idx}
            className="border p-4 rounded-lg shadow transition-transform transform hover:scale-104 hover:z-20 hover:shadow-2xl bg-white relative"
          >
            <h2 className="text-lg font-semibold">{prod.title}</h2>
            <p className="text-sm text-gray-600">{prod.description}</p>
            <p className="text-sm">Category: {prod.category}</p>
            <p className="text-sm font-bold">Price: ₹{prod.price}</p>

            <div className="flex justify-center my-2">
              <img
                src={prod.image_url}
                alt={prod.title}
                className="max-w-full max-h-40 object-cover rounded cursor-pointer"
                onClick={() => setPreviewImg(prod.image_url)}
              />
            </div>

            <Button
              className="w-full mt-2"
              onClick={() => handleSingleProduct(prod.seller_email)}
            >
              View Seller's Products
            </Button>
          </div>
        ))}
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            className="max-h-[90%] max-w-[90%] rounded-lg shadow-xl transition-transform transform scale-100 hover:scale-105"
            alt="Preview"
          />
        </div>
      )}
    </div>
  );
}
