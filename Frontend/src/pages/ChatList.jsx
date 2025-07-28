import React, { useEffect, useState ,useRef} from "react";
import { useNavigate } from "react-router-dom";

export default function ChatList() {
  const [users, setUsers] = useState([]); // default empty array
  const navigate = useNavigate();
const hasAlerted = useRef(false); 
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
      try {
        const res = await fetch("http://localhost:5000/api/getemail", {
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

  return (
    <div className="min-h-screen"style={{ padding: "20px" }}>  {emaill ? <h4></h4> : <h4>Login is needed</h4>}
     <div className="flex justify-between"> <h2 className="mb-8 font-bold text-3xl">Your Chats</h2>
      <button className="rounded-lg bg-red-600 hover:bg-red-800 text-white text-sm leading-none h-8 px-4 py-1"
    onClick={() => navigate(-1)}>Back</button></div>
      <div className="border rounded-2xl shadow p-4 bg-gray-200">
      {users.length === 0 ? (
        <p>No chats yet</p>
      ) : (
        <ul>
          {users.map((u, i) => (
            <li className="hover:text-blue-800"
              key={i}
              style={{ cursor: "pointer", padding: "10px", borderBottom: "1px solid #ccc" }}
              onClick={() => navigate("/chat", { state: { email: u.chat_with } })}
            >
              {u.chat_with}
            </li>
          ))}
        </ul>
      )}
    </div></div>
  );
}
