import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { state, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Bruno's IMS Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {state.user?.name}</span>
            <span className="role-badge">{state.user?.role}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <nav>
            <ul>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/products">Products</a></li>
              <li><a href="#categories">Categories</a></li>
              <li><a href="#orders">Orders</a></li>
              <li><a href="#inventory">Inventory</a></li>
              {state.user?.role === 'admin' && (
                <li><a href="#users">Users</a></li>
              )}
            </ul>
          </nav>
        </aside>

        <main className="main-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Products</h3>
              <p className="stat-number">-</p>
              <p className="stat-label">In Inventory</p>
            </div>
            
            <div className="stat-card">
              <h3>Low Stock Items</h3>
              <p className="stat-number">-</p>
              <p className="stat-label">Need Attention</p>
            </div>
            
            <div className="stat-card">
              <h3>Pending Orders</h3>
              <p className="stat-number">-</p>
              <p className="stat-label">To Process</p>
            </div>
            
            <div className="stat-card">
              <h3>Monthly Sales</h3>
              <p className="stat-number">$-</p>
              <p className="stat-label">This Month</p>
            </div>
          </div>

          <div className="actions-grid">
            <div className="action-card">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <a href="/products" className="action-btn">Add Product</a>
                <button className="action-btn">Create Order</button>
                <button className="action-btn">Check Inventory</button>
                <button className="action-btn">View Reports</button>
              </div>
            </div>

            <div className="action-card">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <p>Welcome to Bruno's IMS!</p>
                <p>Your integrated management system is ready to use.</p>
                <p>Start by adding some products and categories.</p>
              </div>
            </div>
          </div>

          <div className="restaurant-info">
            <h3>Restaurant Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Restaurant:</label>
                <span>{state.user?.restaurant}</span>
              </div>
              <div className="info-item">
                <label>Country:</label>
                <span>{state.user?.country}</span>
              </div>
              <div className="info-item">
                <label>Your Role:</label>
                <span className="role-badge">{state.user?.role}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;