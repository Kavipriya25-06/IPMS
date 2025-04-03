import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ShoppingCart from "../assets/cart.png"; // Import Cart Icon

const CartIcon = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null; // Don't render if user is not logged in
  if (!(user.role === "Admin" || user.role === "Procurement" || user.role === "Sub-Admin")) return null; // Don't render if user is not logged in
  const isActive = location.pathname === "/cart";

  return (
    <img
      src={ShoppingCart}
      alt="Cart"
      onClick={() => navigate("/cart")}
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

export default CartIcon;
