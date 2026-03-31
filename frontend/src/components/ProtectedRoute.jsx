import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles = [], allowedEmails = [] }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // blocked user check
  if (user.isBlocked) {
    return <Navigate to="/login" replace />;
  }

  // role check
  const roleAllowed =
    allowedRoles.length === 0 || allowedRoles.includes(user.role);

  // email check
  const emailAllowed =
    allowedEmails.length === 0 || allowedEmails.includes(user.email);

  // if any provided condition fails => deny
  if (!roleAllowed || !emailAllowed) {
    if (!roleAllowed) {
      if (user.role === "admin")
        return <Navigate to="/adminDashboard" replace />;
      if (user.role === "student") return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
