<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";

=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
>>>>>>> main
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="pt-[70px] min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
