import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagementPage from "./pages/UserManagementPage";
import Group from "./pages/Group";
import CreateGroup from "./pages/CreateGroup";
import Material from "./pages/Material";
import UploadedMaterials from "./pages/UploadedMaterials";
import MaterialApproval from "./pages/MaterialApproval";
import MaterialsDelete from "./pages/MaterialsDelete";
import AdminLoginPage from "./pages/AdminLoginPage";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AdminThemeProvider } from "./context/AdminThemeContext";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminModulePlaceholderPage from "./pages/AdminModulePlaceholderPage";
import AdminAnalyticsUserManagement from "./pages/AdminAnalyticsUserManagement";
import AdminReportsUserManagement from "./pages/AdminReportsUserManagement";
import StudentFeedbackPage from "./pages/StudentFeedbackPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";

function Layout({ children }) {
  const location = useLocation();

  // ✅ UPDATED: include admin pages also
  const showNavbar =
    location.pathname === "/" ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/materials") ||
    location.pathname.startsWith("/uploaded-materials") ||
    location.pathname.startsWith("/groups") ||
    location.pathname.startsWith("/posts") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/adminDashboard") ||
    location.pathname.startsWith("/userManagement") ||
    location.pathname.startsWith("/dashboard/feedback") ||
    location.pathname.startsWith("/admin/feedback");

  return (
    <>
      {showNavbar && <Navbar />}
      <main className="pt-[70px] min-h-screen">{children}</main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminThemeProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public home route */}
              <Route path="/" element={<HomePage />} />
              {/* Public routes */}
              <Route
                path="/groups"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Group />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/:groupId"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Group />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/create"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <CreateGroup />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              {/* ---------------- STUDENT ---------------- */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student", "admin"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/feedback"
                element={
                  <ProtectedRoute allowedRoles={["student", "admin"]}>
                    <StudentFeedbackPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/materials"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Material />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/uploaded-materials"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <UploadedMaterials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/material-approval"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <MaterialApproval />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/materials-delete"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <MaterialsDelete />
                  </ProtectedRoute>
                }
              />
              {/* Protected admin routes */}
              <Route
                path="/adminDashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/userManagement"
                element={
                  <ProtectedRoute
                    allowedRoles={["admin"]}
                    allowedEmails={[
                      "yomal@gmail.com",
                      "admin1uniconnect@gmail.com",
                      "admin1@example.com",
                    ]}
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
                path="/admin/feedback"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminFeedbackPage />
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
                path="/admin/reports/user-management"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminReportsUserManagement />
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
                path="/posts"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Posts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts/create"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts/:id"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PostDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AdminThemeProvider>
    </AuthProvider>
  );
}

export default App;
