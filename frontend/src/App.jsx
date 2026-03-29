import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="pt-[70px] min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/groups" element={<Group />} />
            <Route path="/groups/:groupId" element={<Group />} />
            <Route path="/groups/create" element={<CreateGroup />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminDashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/create" element={<CreatePost />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}
export default App;
