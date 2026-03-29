import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import Groups from "./pages/Groups";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import UserManagementPage from "./pages/UserManagementPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function Layout({ children }) {
  // Show Navbar only on student-facing pages.
  const location = useLocation();
  const showNavbar =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/posts") ||
    location.pathname.startsWith("/materials") ||
    location.pathname.startsWith("/groups");

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
            <Route path="/" element={<Navigate to="/posts" replace />} />

            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<LoginPage />} />

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
                  <Materials />
                </ProtectedRoute>
              }
            />

            <Route
              path="/groups"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Groups />
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
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={<Navigate to="/userManagement" replace />}
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
