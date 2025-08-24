import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const canAccessRestaurants = () => {
    return user?.role === 'manager' || user?.role === 'admin';
  };

  const canAccessUsers = () => {
    return user?.role === 'manager' || user?.role === 'admin';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'linecook': return 'Line Cook';
      case 'chef': return 'Chef';
      case 'manager': return 'Manager';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Bruno's IMS</h1>
            <p className="tagline">Integrated Management System</p>
          </div>
          
          {user && (
            <div className="user-section">
              <div className="user-info">
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <span className="user-role">{getRoleDisplayName(user.role)}</span>
              </div>
              <button 
                className="mobile-menu-toggle"
                onClick={toggleMobileMenu}
                aria-label="Toggle navigation"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          )}
        </div>
      </header>
      
      {user && (
        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <ul>
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
            </li>
            {canAccessRestaurants() && (
              <li>
                <Link 
                  to="/restaurants" 
                  className={location.pathname === '/restaurants' ? 'active' : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nav-icon">🏪</span>
                  Restaurants
                </Link>
              </li>
            )}
            {canAccessUsers() && (
              <li>
                <Link 
                  to="/users" 
                  className={location.pathname === '/users' ? 'active' : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nav-icon">👥</span>
                  Users
                </Link>
              </li>
            )}
            <li className="logout-item">
              <button 
                className="logout-button"
                onClick={handleLogout}
              >
                <span className="nav-icon">🚪</span>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      )}
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;