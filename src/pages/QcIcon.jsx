import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import QC from "../assets/QC_icon.svg"; // Import Cart Icon

const QcIcon = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null; // Don't render if user is not logged in
  if (
    !(
      user.role === "Admin" ||
      user.role === "Inventory" ||
      user.role === "Sub-Admin"
    )
  )
    return null; // Don't render if user is not logged in
  const isActive = location.pathname === "/qcform";

  return (
  <div
  style={{
    width: "40px",
    height: "40px",
    border: isActive ? "2px solid #28a745" : "2px solid transparent",
    borderRadius: "50%",
    padding: "1px",
    backgroundColor: isActive ? "#e9f9ee" : "transparent",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    boxShadow: isActive ? "0 0 4px rgba(40, 167, 69, 0.4)" : "none",
  }}
  onClick={() => navigate("/qcform")}
>
 <img
  src={QC}
  alt="questions"
  title="QC Questions Page" 
  style={{
    width: "24px",
    height: "24px",
    objectFit: "contain",
    cursor: "pointer",     
  }}
/>

</div>


  );
};

export default QcIcon;
