// src/pages/HomePage.jsx
import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome to Inventory Management</h2>
      {!user && (
        <button
          onClick={() => navigate("/login")}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Login
        </button>
      )}
    </div>
  );
};

export default HomePage;
