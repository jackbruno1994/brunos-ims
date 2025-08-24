import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import LineCookDashboard from './components/LineCookDashboard';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import Users from './pages/Users';
import './App.css';

// Component to handle role-based dashboard routing
const RoleDashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'linecook':
      return <LineCookDashboard />;
    case 'chef':
    case 'manager':
    case 'admin':
    default:
      return <Dashboard />;
  }
};

// Component to render unauthorized access page
const Unauthorized: React.FC = () => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center',
    height: '50vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }}>
    <h2>Access Denied</h2>
    <p>You don't have permission to access this page.</p>
  </div>
);

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RoleDashboard />} />
        <Route 
          path="/restaurants" 
          element={
            <ProtectedRoute requiredRole="manager">
              <Restaurants />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requiredRole="manager">
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;