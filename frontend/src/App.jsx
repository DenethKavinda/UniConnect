// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Dashboard from './pages/Dashboard';
// import AdminDashboard from "./pages/AdminDashboard";
// import UserManagementPage from "./pages/UserManagementPage";
// import { AuthProvider } from './context/AuthContext';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Navbar />
//         <main className="pt-[70px] min-h-screen">
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="*" element={<Dashboard />} />
//             <Route path="adminDashboard" element={<AdminDashboard />} />
//             <Route path="userManagementPage" element={<UserManagementPage />} />
            
//           </Routes>
//         </main>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;



import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagementPage from "./pages/UserManagementPage";
import Dashboard from "./pages/Dashboard"; // student dashboard
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

          {/* student protected route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student", "admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* admin protected routes */}
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

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
