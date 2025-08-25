import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import Users from './pages/Users';
import OrderProcessing from './pages/OrderProcessing';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/users" element={<Users />} />
          <Route path="/orders" element={<OrderProcessing />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;