import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminThemeProvider } from "./context/AdminThemeContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagementPage from "./pages/UserManagementPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminModulePlaceholderPage from "./pages/AdminModulePlaceholderPage";
import AdminAnalyticsUserManagement from "./pages/AdminAnalyticsUserManagement";
import AdminReportsUserManagement from "./pages/AdminReportsUserManagement";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <AdminThemeProvider>
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
                allowedEmails={["yomal@gmail.com", "admin1uniconnect@gmail.com"]}
              >
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics/user-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAnalyticsUserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics/:moduleKey"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminModulePlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports/:moduleKey"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminModulePlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports/user-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminReportsUserManagement />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminThemeProvider>
    </AuthProvider>
  );
}

export default App;