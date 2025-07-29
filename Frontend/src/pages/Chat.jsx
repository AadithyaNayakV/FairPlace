// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// export default function Chat() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // email of the *other* user (receiver)
//   const receiver = location.state?.email || "";

//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Redirect if no receiver passed
//   useEffect(() => {
//     if (!receiver) {
//       navigate("/home");
//     }
//   }, [receiver, navigate]);

//   // Fetch all messages in this chat
//   async function getMessages() {
//     if (!receiver) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`http://localhost:5000/api/getMessages?chat_with_email=${receiver}&onlyUnread=true`,

//         {
//           method: "GET",
//           credentials: "include", // send cookies (token) to backend
//         }
//       );
//       if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//       const data = await res.json();
//       setMessages(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Send a message
//   async function sendMessage() {
//     if (!text.trim() || !receiver) return;
//     try {
//       const res = await fetch("http://localhost:5000/api/sendMessage", {
//         method: "POST",
//         credentials: "include", // include cookies for token auth
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           receiver_email: receiver,
//           content: text.trim(),
//         }),
//       });
//       if (!res.ok) {
//         alert(`Send failed (${res.status})`);
//         return;
//       }
//       setText("");
//       // Refresh messages after sending
//       getMessages();
//     } catch (err) {
//       console.error(err);
//       alert("Send error");
//     }
//   }

 
//   useEffect(() => {
//     getMessages();
//     // const interval = setInterval(getMessages, 5000);
//     // return () => clearInterval(interval);
//   }, [receiver]);

//   // Optional: send on Enter
//   function handleKeyDown(e) {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   }

//   return (
//     <div style={{ padding: 16, maxWidth: 500, margin: "0 auto" }}>
//       <h3>Chat with {receiver || "Unknown"}</h3>

//       <div
//         style={{
//           border: "1px solid #ccc",
//           padding: 8,
//           height: 250,
//           overflowY: "auto",
//           marginBottom: 8,
//         }}
//       >
//         {loading && messages.length === 0 && <p>Loading...</p>}
//         {messages.length === 0 && !loading && <p>No messages yet.</p>}
//         {messages.map((m) => {
//           const mine = m.is_mine ?? (m.sender_email && m.sender_email !== receiver ? true : false);
//           // NOTE: if backend doesn't send is_mine, we fallback guess by comparing sender_email to receiver.
//           // Better: backend should include a boolean.
//           return (
//             <div
//               key={m.id}
//               style={{
//                 textAlign: mine ? "right" : "left",
//                 margin: "4px 0",
//               }}
//             >
//               <span
//                 style={{
//                   display: "inline-block",
//                   padding: "4px 8px",
//                   borderRadius: 6,
//                   background: mine ? "#d1ffd1" : "#eee",
//                   maxWidth: "80%",
//                   wordBreak: "break-word",
//                 }}
//               >
//                 {m.content}
//               </span>
//             </div>
//           );
//         })}
//       </div>

//       <input
//         type="text"
//         value={text}
//         placeholder="Type a message"
//         onChange={(e) => setText(e.target.value)}
//         onKeyDown={handleKeyDown}
//         style={{ width: "80%", marginRight: 8 }}
//       />
//       <button onClick={sendMessage}>Send</button>

//       <div style={{ marginTop: 12 }}>
//         <button onClick={() => navigate(-1)}>Back</button>
//         <button style={{ marginLeft: 8 }} onClick={getMessages}>
//           Refresh
//         </button>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const receiver = location.state?.email || "";
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const pollRef = useRef(null);
  const boxRef = useRef(null);

  // scroll helper
  const scrollBottom = () => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  };

  // load full chat when page opens
  useEffect(() => {
    if (!receiver) {
      navigate("/home");
      return;
    }
    getAllMessages();
  }, [receiver]);

  // polling unread new messages
  useEffect(() => {
    if (!receiver) return;
     setMessages([]);
    pollRef.current = setInterval(getUnreadMessages, 4000);
    return () => clearInterval(pollRef.current);
  }, [receiver]);

  async function getAllMessages() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/getMessages?chat_with_email=${encodeURIComponent(receiver)}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      requestAnimationFrame(scrollBottom);
    } catch (err) {
      console.error("getAllMessages:", err);
    }
  }

  // get only messages after last_read_message_id (backend uses chat_status)
  async function getUnreadMessages() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/getUnreadMessages?chat_with_email=${encodeURIComponent(receiver)}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data)
        requestAnimationFrame(scrollBottom);
      }
    } catch (err) {
      console.error("getUnreadMessages:", err);
    }
  }

  async function sendMsg() {
    if (!text.trim() || !receiver) return;
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/sendmsg`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ receiver, text }),
      });
      setText("");
      // after sending, reload full chat (marks read)
      getAllMessages();
    } catch (err) {
      console.error("sendMsg:", err);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMsg();
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
      } else { alert('login is needed')
        navigate('/')
        setemail(null);
      }
    }
    fetchEmail();
  }, []);
const alreadyAlerted = useRef(false); // persists across re-renders

useEffect(() => {
  if (emaill === receiver && !alreadyAlerted.current) {
    alreadyAlerted.current = true;
    alert("This is Your Product");
    navigate(-1);
  }
}, [emaill, receiver]);
  return (
  <div className=" min-h-screen "style={{ padding: 20 }}>
    {emaill ? (
      <div>
        
        <h1 className="text-2xl mb-10">Chat with {receiver}</h1>

        <div
          ref={boxRef}
          // className="border-2"
          style={{
            border: "2px solid black",
            height: 300,
            overflowY: "auto",
            padding: 8,
            marginBottom: 8,
          }}
          
        >
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                style={{
                  textAlign: m.sender_email === receiver ? "left" : "right",
                  margin: "4px 0",
                }}
              >
                <span
                  style={{
                    background: m.sender_email === receiver ? "#eee" : "#d1ffd1",
                    padding: "4px 8px",
                    borderRadius: 6,
                    display: "inline-block",
                    maxWidth: "80%",
                    wordBreak: "break-word",
                  }}
                >
                  {m.content}
                </span>
              </div>
            ))
          )}
        </div>
<div className=" bottom-4 m w-full">
        <input className="  p-2 border-1 border-black rounded-2xl "
          type="text"
          value={text}
          placeholder="message"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ width: "80%", marginRight: 8 }}
        />
        <button className="border-2 rounded-2xl px-2 p-1 bg-green-400 hover:bg-green-700"onClick={sendMsg}>Send</button>

        <div style={{ marginTop: 12,  }}>
          <button className="border-2 rounded-2xl px-2 p-1 bg-red-500 hover:bg-red-700" onClick={() => navigate(-1)}>Back</button>
          <button className="border-2 rounded-2xl px-2 p-1 bg-gray-300 hover:bg-gray-500" style={{ marginLeft: 8 }} onClick={getAllMessages}>
            Refresh
          </button>
        </div></div>
      </div>
    ) : (
      <h4>Login is needed</h4>
    )}
  </div>
);
}