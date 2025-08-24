import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SmartSearch from './SmartSearch';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Mock user data - in real app this would come from auth context
  const mockUser = {
    id: 'user123',
    restaurantId: 'rest1',
    role: 'line_cook'
  };

  const handleSearchResult = (result: any) => {
    console.log('Selected search result:', result);
    // Handle navigation to selected item
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="logo-section">
            <h1>Bruno's IMS</h1>
            <p>Advanced Order Processing System</p>
          </div>
          
          <div className="search-section">
            <SmartSearch
              restaurantId={mockUser.restaurantId}
              userId={mockUser.id}
              context="general"
              placeholder="Search recipes, ingredients, orders..."
              onResultSelect={handleSearchResult}
            />
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <span className="user-name">Line Cook</span>
              <span className="user-role">{mockUser.role.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="quick-actions">
              <Link to="/quick-access" className="quick-action-btn">
                ⚡ Quick Access
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <nav className="nav">
        <ul className="nav-list">
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/restaurants" 
              className={location.pathname === '/restaurants' ? 'active' : ''}
            >
              🏪 Restaurants
            </Link>
          </li>
          <li>
            <Link 
              to="/users" 
              className={location.pathname === '/users' ? 'active' : ''}
            >
              👥 Users
            </Link>
          </li>
          <li>
            <Link 
              to="/analytics" 
              className={location.pathname === '/analytics' ? 'active' : ''}
            >
              📈 Analytics
            </Link>
          </li>
          <li>
            <Link 
              to="/quick-access" 
              className={location.pathname === '/quick-access' ? 'active' : ''}
            >
              ⚡ Quick Access
            </Link>
          </li>
          <li>
            <Link 
              to={`/dashboard/${mockUser.role}`}
              className={location.pathname.includes('/dashboard/') ? 'active' : ''}
            >
              🎯 My Dashboard
            </Link>
          </li>
        </ul>
        
        <div className="nav-secondary">
          <div className="system-status">
            <span className="status-indicator online">🟢</span>
            <span className="status-text">Online</span>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        {children}
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header-top {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 20px;
          align-items: center;
          padding: 20px 30px;
        }

        .logo-section h1 {
          margin: 0 0 5px 0;
          font-size: 28px;
          font-weight: 700;
        }

        .logo-section p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .search-section {
          display: flex;
          justify-content: center;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 20px;
          justify-content: flex-end;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name {
          font-weight: 600;
          font-size: 16px;
        }

        .user-role {
          font-size: 12px;
          opacity: 0.8;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 10px;
          margin-top: 2px;
        }

        .quick-action-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .quick-action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .nav {
          background: #343a40;
          padding: 0 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0;
        }

        .nav-list li a {
          display: block;
          color: #adb5bd;
          text-decoration: none;
          padding: 15px 20px;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
          font-weight: 500;
        }

        .nav-list li a:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-list li a.active {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border-bottom-color: #007bff;
        }

        .nav-secondary {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #adb5bd;
          font-size: 14px;
        }

        .status-indicator {
          font-size: 12px;
        }

        .main-content {
          flex: 1;
          background: #f8f9fa;
          min-height: calc(100vh - 160px);
        }

        @media (max-width: 1024px) {
          .header-top {
            grid-template-columns: 1fr;
            gap: 15px;
            text-align: center;
          }
          
          .user-section {
            justify-content: center;
          }
          
          .nav {
            padding: 0 15px;
          }
          
          .nav-list {
            flex-wrap: wrap;
          }
          
          .nav-list li a {
            padding: 12px 15px;
            font-size: 14px;
          }
        }

        @media (max-width: 768px) {
          .header-top {
            padding: 15px;
          }
          
          .logo-section h1 {
            font-size: 24px;
          }
          
          .nav-list {
            justify-content: center;
          }
          
          .nav-secondary {
            display: none;
          }
        }
        `
      }} />
    </div>
  );
};

export default Layout;