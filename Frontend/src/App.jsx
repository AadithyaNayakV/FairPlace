// App.js
import React, { useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Myprofile from './pages/Myprofile';
import ProForm from './pages/ProForm';
import Seller from './pages/Seller';
import Wishlist from './pages/Wishlist';
import Search from './pages/Search';
import Review from './pages/Review';
import Chat from './pages/Chat';
import ChatList from './pages/ChatList';
import Chatbot from './pages/Chatbit';
import Robot from './pages/Robot';
import "./App.css";


export default function App() {
   // Example usage (optional)

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/myprofile" element={<Myprofile />} />
        <Route path="/proform" element={<ProForm />} />
        <Route path="/seller" element={<Seller />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/search" element={<Search />} />
        <Route path="/review" element={<Review />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chatlist" element={<ChatList/>} />
        <Route path="/chatbot" element={<Chatbot/>} />
        <Route path="/robot" element={<Robot/>} />

      </Routes>
    </>
  );
}
