import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/users" element={<Users />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;