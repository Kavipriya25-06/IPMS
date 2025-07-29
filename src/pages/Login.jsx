import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config.js";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState(""); // For reset
  const [error, setError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch(`${config.apiBaseURL}/register/`);
    const users = await response.json();
    const user = users.find((u) => u.email === email);

    if (!user) {
      setError("Email not found.");
      return;
    }

    if (!user.status) {
      setError("Your account is inactive. Please contact admin.");
      return;
    }

    const success = await login(email, password);
    if (success) {
      localStorage.setItem("userRole", user.role);

      // Define sidebar tiles here (or import from a shared config file)
      const tiles = [
        { label: "Components", path: "/components", roles: ["Admin", "Sub-Admin", "Procurement", "Inventory"] },
        { label: "Inventory", path: "/inventory", roles: ["Admin", "Sub-Admin", "Inventory", "Finance"] },
        { label: "Vendor", path: "/vendor", roles: ["Admin", "Sub-Admin", "Procurement"] },
        { label: "Bom", path: "/bom", roles: ["Admin", "Sub-Admin", "Procurement"] },
        { label: "Projects", path: "/projects", roles: ["Admin", "Sub-Admin", "Inventory", "User", "Procurement", "Finance"] },
        { label: "Requests", path: "/requests", roles: ["Admin", "Sub-Admin", "Procurement", "User", "Inventory"] },
        { label: "Cart", path: "/cart", roles: ["Admin", "Procurement"] },
        { label: "PO List", path: "/po-list", roles: ["Admin", "Sub-Admin", "Procurement", "Finance"] },
        { label: "Inward", path: "/inward", roles: ["Admin", "Sub-Admin", "Inventory"] },
        { label: "Add Tags", path: "/addtags", roles: ["Admin", "Inventory", "Procurement"] },
        { label: "MRF List", path: "/Mrf", roles: ["Admin", "Procurement", "Inventory", "User"] },
        { label: "MRF Create", path: "/MrfCreate", roles: ["Admin", "Procurement", "Inventory", "User"] },
        { label: "Roles", path: "/roles", roles: ["Admin"] },
      ];

      const firstAllowedTile = tiles.find((tile) => tile.roles.includes(user.role));
      if (firstAllowedTile) {
        navigate(firstAllowedTile.path); //  Redirect to first allowed page
      } else {
        navigate("/"); // fallback
      }
    } else {
      setError("Invalid email or password");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("Something went wrong. Try again.");
  }
};


  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseURL}/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessToast(
          "Success! You can now change your password through the link sent to your email."
        );
        setError(""); // Clear any previous error
      } else {
        // Backend returns { error: "Email not found." }
        setError(data.error || "Failed to send reset link.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Something went wrong. Please try again later.");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseURL}/register/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        alert("Password updated successfully!");
        setShowResetPassword(false);
        setNewPassword("");
        setError("");
      } else {
        const errorData = await response.json();
        console.error("Reset error:", errorData);
        setError("Failed to reset password.");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Something went wrong.");
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src="/aero.png" alt="Company Logo" />
      <img
  style={{ marginTop: "-130px", display: "block", marginLeft: "auto", marginRight: "auto" }}
  className="animate-float"
  src="https://sp-ao.shortpixel.ai/client/to_webp,q_lossy,ret_img/https://iotechworld.com/wp-content/uploads/2023/03/agribot.webp"
  alt="Company Logo"
/>


      </div>
      <div className="login-box">
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={showResetPassword}
            />
            <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  backgroundColor: "transparent",
                  color: "#007bff",
                  border: "none",
                  padding: "10px",
                  fontSize: "14px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  transition: "color 0.2s ease-in-out",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
                onMouseOver={(e) => (e.target.style.color = "#0056b3")}
                onMouseOut={(e) => (e.target.style.color = "#007bff")}
              >
                Forgot password?
              </button>
          </div>
          

          {!showResetPassword ? (
            <>
              <button type="submit" className="login-button">
                Login
              </button>
              
            </>
          ) : (
            <>
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleResetPassword}
                className="login-button"
              >
                Reset Password
              </button>
            </>
          )}
        </form>
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default Login;
