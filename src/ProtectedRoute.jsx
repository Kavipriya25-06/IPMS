import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to home if role not allowed
  }

  return children; // Render the protected component
};

export default ProtectedRoute;
