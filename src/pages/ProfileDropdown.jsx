import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import defaultProfilePic from "../assets/profile.png"; // Placeholder image

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  if (!user) return null; // Don't render if user is not logged in

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* Profile Picture */}
      <img
        src={defaultProfilePic}
        alt="Profile"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          cursor: "pointer",
          border: "2px solid #ddd",
        }}
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "0",
            background: "#fff",
            border: "1px solid #ddd",
            boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
            borderRadius: "5px",
            width: "400px",
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()} // Prevents closing when clicking insidde
        >
          <div style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            <p style={{ margin: "5px 0" }}>
              Logged in as: <strong>{user.email}</strong>
            </p>
            <p style={{ margin: "5px 0" }}>
              Role: <em>{user.role}</em>
            </p>
          </div>

          {user.role === "Admin" && (
            <button
              onClick={() => navigate("/roles")}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                border: "none",
                backgroundColor: "#f5f5f5",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              Roles
            </button>
          )}

          <button
            onClick={logout}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              border: "none",
              backgroundColor: "#f8d7da",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
