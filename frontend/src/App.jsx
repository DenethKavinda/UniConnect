import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagementPage from "./pages/UserManagementPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* student/admin dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student", "admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* all admins can access */}
          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* only admin role + specific username */}
          <Route
            path="/userManagement"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
                allowedEmails={["yomal@gmail.com", "admin@uniconnect.com"]}
              >
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;