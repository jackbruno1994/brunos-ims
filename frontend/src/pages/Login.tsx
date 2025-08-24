import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@brunos-ims.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Bruno's IMS</h1>
          <p>Integrated Management System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        
        <div className="demo-info">
          <h3>Demo Credentials</h3>
          <p>Email: admin@brunos-ims.com</p>
          <p>Password: password</p>
          <p><small>This will log you in as a Super Admin with full permissions</small></p>
        </div>
      </div>
    </div>
  );
};

export default Login;