import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Group from "./pages/Group";
import CreateGroup from "./pages/CreateGroup";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import Material from "./pages/Material";
import UploadedMaterials from "./pages/UploadedMaterials";
import MaterialApproval from "./pages/MaterialApproval"; // ✅ NEW
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function Layout({ children }) {
  const location = useLocation();

  // ✅ UPDATED: include admin pages also
  const showNavbar =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/materials") ||
    location.pathname.startsWith("/uploaded-materials");
  // location.pathname.startsWith("/adminDashboard") ||
  // location.pathname.startsWith("/material-approval"); // ✅ NEW

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
      <Router>
        <Layout>
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public routes */}
            <Route path="/groups" element={<Group />} />
            <Route path="/groups/:groupId" element={<Group />} />
            <Route path="/groups/create" element={<CreateGroup />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* ---------------- STUDENT ---------------- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
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

            {/* ---------------- ADMIN ---------------- */}
            <Route
              path="/adminDashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* ✅ NEW: Material Approval Page */}
            <Route
              path="/material-approval"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MaterialApproval />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
