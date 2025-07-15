import React, { useState } from 'react';
import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { UserContext } from './UserContext';

// Components
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Myprofile from './pages/Myprofile';
import ProForm from './pages/ProForm';
import Seller from './pages/Seller';
import Wishlist from './pages/Wishlist';
import Search from './pages/Search';

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");

  return (
    <UserContext.Provider value={{ email, setEmail, password, setPassword, role, setRole }}>
   
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/myprofile" element={<Myprofile />} />
          <Route path="/proform" element={<ProForm />} />
          <Route path="/seller" element={<Seller />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/search" element={<Search />} />
        </Routes>
     
    </UserContext.Provider>
  );
}

export default App;
