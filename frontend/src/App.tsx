import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import Users from './pages/Users';
import AnalyticsPage from './pages/AnalyticsPage';
import QuickAccessMode from './components/QuickAccessMode';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import './App.css';

// Mock user data - in a real app this would come from authentication
const mockUser = {
  id: 'user123',
  restaurantId: 'rest1',
  role: 'line_cook' // Can be: admin, manager, staff, line_cook, prep_cook, head_chef
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analytics" element={<AnalyticsPage restaurantId={mockUser.restaurantId} />} />
          <Route 
            path="/quick-access" 
            element={
              <QuickAccessMode 
                userId={mockUser.id}
                restaurantId={mockUser.restaurantId}
                role={mockUser.role}
              />
            } 
          />
          <Route 
            path="/dashboard/:role" 
            element={
              <RoleBasedDashboard 
                userId={mockUser.id}
                restaurantId={mockUser.restaurantId}
                role={mockUser.role}
              />
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;