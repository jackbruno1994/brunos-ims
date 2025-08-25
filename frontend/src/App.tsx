import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import Users from './pages/Users';
import AuditDashboard from './pages/AuditDashboard';
import AuditLogs from './pages/AuditLogs';
import SecurityEvents from './pages/SecurityEvents';
import Analytics from './pages/Analytics';
import Compliance from './pages/Compliance';
import Investigations from './pages/Investigations';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/users" element={<Users />} />
          
          {/* Audit System Routes */}
          <Route path="/audit" element={<AuditDashboard />} />
          <Route path="/audit/logs" element={<AuditLogs />} />
          <Route path="/audit/security" element={<SecurityEvents />} />
          <Route path="/audit/analytics" element={<Analytics />} />
          <Route path="/audit/compliance" element={<Compliance />} />
          <Route path="/audit/investigations" element={<Investigations />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;