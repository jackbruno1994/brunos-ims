import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const { state, login, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (state.error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Bruno's IMS</h1>
          <p>Integrated Management System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={state.isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={state.isLoading}
            />
          </div>

          {state.error && (
            <div className="error-message">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={state.isLoading}
          >
            {state.isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;