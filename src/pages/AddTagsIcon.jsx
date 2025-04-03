import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import TagIconpng from "../assets/tag.png"; // Import Cart Icon

const TagIcon = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null; // Don't render if user is not logged in
  if (
    !(
      user.role === "Admin" ||
      user.role === "Procurement" ||
      user.role === "Inventory" ||
      user.role === "Sub-Admin"
    )
  )
    return null; // Don't render if user is not logged in
  const isActive = location.pathname === "/addtags";

  return (
    <img
      src={TagIconpng}
      alt="Tags"
      onClick={() => navigate("/addtags")}
      style={{
        width: "40px",
        height: "40px",
        cursor: "pointer",
        border: isActive ? "2px solid green" : "2px solid transparent",
        borderRadius: "50%",
        padding: "3px",
        backgroundColor: isActive ? "#e6ffe6" : "transparent",
      }}
    />
  );
};

export default TagIcon;
