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
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import Material from "./pages/Material";
import UploadedMaterials from "./pages/UploadedMaterials";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function Layout({ children }) {
  // Show Navbar only on dashboard pages and materials pages
  const location = useLocation();
  const showNavbar =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/materials") ||
    location.pathname.startsWith("/uploaded-materials") ||
    location.pathname.startsWith("/posts");

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
            {/* Default route goes to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public routes */}
            <Route path="/groups" element={<Group />} />
            <Route path="/groups/:groupId" element={<Group />} />
            <Route path="/groups/create" element={<CreateGroup />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected student routes */}
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

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
