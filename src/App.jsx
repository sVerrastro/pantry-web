import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Pantry from './pages/Pantry';
import ItemDetail from './pages/ItemDetail';
import AddItem from './pages/AddItem';
import Shopping from './pages/Shopping';
import Profile from './pages/Profile';

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = [
    { path: '/', emoji: '🏠', label: 'Home' },
    { path: '/pantry', emoji: '📦', label: 'Dispensa' },
    { path: '/shopping', emoji: '🛒', label: 'Spesa' },
    { path: '/profile', emoji: '👤', label: 'Profilo' },
  ];
  const hiddenPaths = ['/login', '/register', '/item/', '/add-item'];
  const hide = hiddenPaths.some(p => location.pathname.startsWith(p));
  if (hide) return null;
  return (
    <nav className="bottom-nav">
      {tabs.map(t => (
        <button key={t.path} className={`nav-item ${location.pathname === t.path ? 'active' : ''}`} onClick={() => navigate(t.path)}>
          <span className="nav-icon">{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <div className="main-content container">
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
              <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
              <Route path="/add-item" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
              <Route path="/add-item/:id" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
              <Route path="/shopping" element={<ProtectedRoute><Shopping /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </div>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
