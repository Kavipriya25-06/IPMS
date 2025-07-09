// src/pages/HomePage.jsx
import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: "200px" }}>
      <h2>Welcome to Inventory Management</h2>
      <div>
        {!user && (
          <button
            onClick={() => navigate("/login")}
            style={{ padding: "10px 20px", fontSize: "16px" }}
          >
            Login
          </button>
        )}
        <button
          onClick={() => navigate("/components")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "1px solid grey",
            cursor: "pointer",
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HomePage;
