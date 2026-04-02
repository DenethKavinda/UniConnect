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
<<<<<<< HEAD
import MaterialApproval from "./pages/MaterialApproval";
import MaterialsDelete from "./pages/MaterialsDelete";
import AdminLoginPage from "./pages/AdminLoginPage";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
=======
import MaterialApproval from "./pages/MaterialApproval"; // ✅ NEW
import MaterialsDelete from "./pages/MaterialsDelete";
>>>>>>> member2-materials
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AdminThemeProvider } from "./context/AdminThemeContext";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminModulePlaceholderPage from "./pages/AdminModulePlaceholderPage";
import AdminAnalyticsUserManagement from "./pages/AdminAnalyticsUserManagement";
import AdminReportsUserManagement from "./pages/AdminReportsUserManagement";

function Layout({ children }) {
  const location = useLocation();

  // ✅ UPDATED: include admin pages also
  const showNavbar =
    location.pathname === "/" ||
    location.pathname.startsWith("/dashboard") ||
<<<<<<< HEAD
    location.pathname.startsWith("/materials") ||
    location.pathname.startsWith("/uploaded-materials") ||
    location.pathname.startsWith("/groups") ||
    location.pathname.startsWith("/posts") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/adminDashboard") ||
    location.pathname.startsWith("/userManagement");
=======
    (location.pathname.startsWith("/materials") &&
      !location.pathname.startsWith("/materials-delete")) ||
    location.pathname.startsWith("/uploaded-materials");
  // location.pathname.startsWith("/adminDashboard") ||
  // location.pathname.startsWith("/material-approval"); // ✅ NEW
>>>>>>> member2-materials

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
<<<<<<< HEAD
      <AdminThemeProvider>
        <Router>
          <Layout>
            <Routes>
            {/* Public home route */}
            <Route path="/" element={<HomePage />} />
=======
      <Router>
        <Layout>
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
>>>>>>> member2-materials

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

<<<<<<< HEAD
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
=======
            {/* ---------------- ADMIN ---------------- */}
            <Route
              path="/materials-delete"
>>>>>>> member2-materials
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MaterialsDelete />
                </ProtectedRoute>
              }
            />
<<<<<<< HEAD

            {/* Protected admin routes */}
=======
>>>>>>> member2-materials
            <Route
              path="/adminDashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

<<<<<<< HEAD
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
=======
            {/* ✅ NEW: Material Approval Page */}
            <Route
              path="/material-approval"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MaterialApproval />
>>>>>>> member2-materials
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AdminThemeProvider>
    </AuthProvider>
  );
}

export default App;
