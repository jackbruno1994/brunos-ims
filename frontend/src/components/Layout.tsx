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
        <p>Integrated Management System for Multi-Country Restaurant Groups</p>
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
          <li>
            <Link 
              to="/audit" 
              className={location.pathname === '/audit' ? 'active' : ''}
            >
              Audit
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