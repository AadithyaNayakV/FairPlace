// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UserContext } from "./UserContext";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
function MainApp() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("buyer");

  return (
    <UserContext.Provider value={{ email, setEmail, password, setPassword, role, setRole }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserContext.Provider>
  );
}

// 👇 Render the component correctly
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);
