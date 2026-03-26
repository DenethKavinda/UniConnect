import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import Dashboard from './pages/Dashboard';
<<<<<<< HEAD
=======
import Group from './pages/Group';
import CreateGroup from './pages/CreateGroup';
>>>>>>> 34e1cc18a5f931370e630853377a1a148d45da6a
import { AuthProvider } from './context/AuthContext';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="pt-[70px] min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
<<<<<<< HEAD
=======
            <Route path="/groups" element={<Group />} />
            <Route path="/groups/create" element={<CreateGroup />} />
>>>>>>> 34e1cc18a5f931370e630853377a1a148d45da6a
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
