import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import defaultProfilePic from "../assets/profile.svg"; // Placeholder image
import { FaUserShield, FaSignOutAlt } from "react-icons/fa"; // Admin icon, Logout icon

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
    <div className="profile-dropdown" ref={dropdownRef}>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: isOpen ? "2px solid #28a745" : "2px solid transparent",
          borderRadius: "50%",
          padding: "1px",
          backgroundColor: isOpen ? "#e9f9ee" : "transparent",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          boxShadow: isOpen ? "0 0 4px rgba(40, 167, 69, 0.4)" : "none",
        }}
        onClick={() => setIsOpen(!isOpen)}
        className="profile-picture"
      >
        <img
          src={defaultProfilePic}
          alt="Profile"
          style={{
            width: "24px",
            height: "24px",
            objectFit: "contain",
          }}
        />
      </div>

      {isOpen && (
        <div
          className="dropdown-overlay"
          onClick={() => setIsOpen(false)} // closes on outside click
        >
          <div
            className="dropdown-menu"
            onClick={(e) => e.stopPropagation()} // prevents inside click from closing
          >
            <div className="dropdown-header">
              <p className="label">
                <span>User:</span> <span className="value">{user.email}</span>
              </p>
              <hr />
              <p className="label">
                <span>Role:</span> <span className="value">{user.role}</span>
              </p>
            </div>

            {user.role === "Admin" && (
              <button
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  navigate("/roles");
                }}
              >
                <FaUserShield className="icon" />
                Roles
              </button>
            )}

            <button className="dropdown-item logout" onClick={logout}>
              <FaSignOutAlt className="icon" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
