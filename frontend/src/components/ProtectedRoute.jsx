import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthUser, getToken } from "../services/courseService";

function ProtectedRoute({ children, adminOnly = false }) {
  const user = getAuthUser();
  const token = getToken();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;