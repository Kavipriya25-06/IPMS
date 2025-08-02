// src/pages/HomePage.jsx
import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
  <div className="landing-container">
  <h2>Welcome to Inventory Management</h2>
  <div className="landing-buttons">
    {!user && (
      <button onClick={() => navigate("/login")}>
        Login
      </button>
    )}
    <button onClick={() => navigate("/components")}>
      Get Started
    </button>
  </div>
</div>

  );
};

export default HomePage;
