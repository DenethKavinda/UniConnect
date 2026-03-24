import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Group from './pages/Group';
import CreateGroup from './pages/CreateGroup';
import { AuthProvider } from './context/AuthContext';
import Discussions from './pages/Discussions';
import DiscussionDetail from './pages/DiscussionDetail';
import CreatePost from './pages/CreatePost';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="pt-[70px] min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
<<<<<<< HEAD
            <Route path="/posts" element={<Discussions />} />
            <Route path="/discussions" element={<Discussions />} />
            <Route path="/posts/new" element={<CreatePost />} />
            <Route path="/posts/:id" element={<DiscussionDetail />} />
=======
            <Route path="/groups" element={<Group />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
