import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigationItems, useRoleDisplayName } from '../hooks/useRBAC';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigationItems = useNavigationItems();
  const roleDisplayName = useRoleDisplayName(user?.role);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>Bruno's IMS</h1>
            <p>Integrated Management System for Multi-Country Restaurant Groups</p>
          </div>
          <div className="header-right">
            {user && (
              <div className="user-info">
                <span className="user-name">
                  {user.firstName} {user.lastName}
                </span>
                <span className="user-role">
                  ({roleDisplayName})
                </span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <nav className="nav">
        <ul>
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;