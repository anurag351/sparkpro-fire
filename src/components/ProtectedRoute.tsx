import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { token, role } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role || ""))
    return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
