import React from "react";
import { useAuth } from "../context/AuthContext";

const AccessControl = ({ allowedRoles, children }) => {
  const { user } = useAuth(); // Get current user role

  // Check if the user's role is allowed
  if (!allowedRoles.includes(user.role)) {
    return <p className="text-red-500">Access Denied</p>;
  }

  return children; // Render content if access is granted
};

export default AccessControl;
