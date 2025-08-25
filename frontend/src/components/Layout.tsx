import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="app">
      <header className="header">
        <h1>Bruno's IMS</h1>
        <p>Integrated Management System with Enhanced Audit & Security</p>
      </header>
      
      <nav className="nav">
        <ul>
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/restaurants" 
              className={location.pathname === '/restaurants' ? 'active' : ''}
            >
              Restaurants
            </Link>
          </li>
          <li>
            <Link 
              to="/users" 
              className={location.pathname === '/users' ? 'active' : ''}
            >
              Users
            </Link>
          </li>
          <li className="nav-section">
            <span>Audit & Security</span>
          </li>
          <li>
            <Link 
              to="/audit" 
              className={location.pathname.startsWith('/audit') ? 'active' : ''}
            >
              Audit Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/audit/logs" 
              className={location.pathname === '/audit/logs' ? 'active' : ''}
            >
              Audit Logs
            </Link>
          </li>
          <li>
            <Link 
              to="/audit/security" 
              className={location.pathname === '/audit/security' ? 'active' : ''}
            >
              Security Events
            </Link>
          </li>
          <li>
            <Link 
              to="/audit/compliance" 
              className={location.pathname === '/audit/compliance' ? 'active' : ''}
            >
              Compliance
            </Link>
          </li>
          <li>
            <Link 
              to="/audit/analytics" 
              className={location.pathname === '/audit/analytics' ? 'active' : ''}
            >
              Analytics
            </Link>
          </li>
          <li>
            <Link 
              to="/audit/investigations" 
              className={location.pathname === '/audit/investigations' ? 'active' : ''}
            >
              Investigations
            </Link>
          </li>
        </ul>
      </nav>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;