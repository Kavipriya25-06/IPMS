import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ShoppingCart from "../assets/Cart.svg"; // Import Cart Icon

const CartIcon = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null; // Don't render if user is not logged in
  if (
    !(
      user.role === "Admin" ||
      user.role === "Procurement" ||
      user.role === "Sub-Admin"
    )
  )
    return null; // Don't render if user is not logged in
  const isActive = location.pathname === "/cart";

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
  onClick={() => navigate("/cart")}
>
  <img
    src={ShoppingCart}
    alt="Cart"
    style={{
      width: "24px",
      height: "24px",
      objectFit: "contain",
    }}
  />
</div>


  );
};

export default CartIcon;
