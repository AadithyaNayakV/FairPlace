import React, { useState ,useEffect} from "react";
import { useNavigate } from "react-router-dom";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
const navigate=useNavigate()
  const sendMessage = async () => {
    if (!userMessage.trim()) return;
    setUserMessage("")

    const newMessages = [...messages, { sender: "user", text: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        credentials:'include',
        
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

    setUserMessage("");
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };
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
    <div style={styles.container}>    
       {emaill ? <h4>Logged in as: {emaill}</h4> : <h4>Login is needed</h4>}

      <h2 style={styles.title}>Gemini Chatbot</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              background: msg.sender === "user" ? "#0078ff" : "#e5e5ea",
              color: msg.sender === "user" ? "#fff" : "#000",
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div style={styles.loading}>Bot is typing...</div>}
      </div>
      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
  },
  chatBox: {
    flex: 1,
    height: "400px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  message: {
    padding: "10px",
    borderRadius: "12px",
    maxWidth: "80%",
  },
  loading: {
    fontStyle: "italic",
    color: "#666",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    background: "#0078ff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Chatbot;
