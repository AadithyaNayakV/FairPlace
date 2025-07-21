import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatList() {
  const [users, setUsers] = useState([]); // default empty array
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("http://localhost:5000/api/chatlist", {
            credentials:'include',
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]); // fallback if response isn't an array
        }
      } catch (err) {
        console.error("Error fetching chat list:", err);
        setUsers([]);
      }
    }
    fetchUsers();
  }, []);
const [emaill, setemail] = useState(null);
  useEffect(() => {
    async function fetchEmail() {
      const res = await fetch("http://localhost:5000/api/getemail", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setemail(data.email);
      } else {
         alert('login is needed')
        navigate('/')
        setemail(null);
      }
    }
    fetchEmail();
  }, []);
  return (
    <div style={{ padding: "20px" }}>  {emaill ? <h4>Logged in as: {emaill}</h4> : <h4>Login is needed</h4>}
      <h2>Your Chats</h2>
      {users.length === 0 ? (
        <p>No chats yet</p>
      ) : (
        <ul>
          {users.map((u, i) => (
            <li
              key={i}
              style={{ cursor: "pointer", padding: "10px", borderBottom: "1px solid #ccc" }}
              onClick={() => navigate("/chat", { state: { email: u.chat_with } })}
            >
              {u.chat_with}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
