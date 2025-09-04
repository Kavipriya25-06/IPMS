import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // Install with: npm install react-icons

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <button
        className="home-button"
        onClick={() => {
          window.location.href = "http://dms.aero360.co.in/";
        }}
      >
        <FaArrowLeft /> Back
      </button>

      <div className="homepage-wrapper">
        <div className="landing-container">
          <h2>Welcome to Inventory Management</h2>
          <div className="landing-buttons">
            {!user && <button onClick={() => navigate("/login")}>Login</button>}
            <button onClick={() => navigate("/dashboard")}>Get Started</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
