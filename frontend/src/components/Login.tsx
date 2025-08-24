import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@brunosims.com', password: 'secret', role: 'Admin' },
    { email: 'manager@brunosims.com', password: 'secret', role: 'Manager' },
    { email: 'chef@brunosims.com', password: 'secret', role: 'Chef' },
    { email: 'linecook@brunosims.com', password: 'secret', role: 'Line Cook' },
  ];

  const loginWithDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login to Bruno's IMS</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-accounts">
          <h3>Demo Accounts:</h3>
          <div className="demo-grid">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                className="demo-button"
                onClick={() => loginWithDemo(account.email, account.password)}
                disabled={loading}
              >
                {account.role}
                <small>{account.email}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;