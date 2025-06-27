import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

import '../App.css'; 

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-wrapper">
      <nav className="login-navbar">
        <span className="login-logo">EcoBook</span>
        <Link to="/register" className="signup-nav-link">Sign Up</Link>
      </nav>

      <div className="login-grid">
        <div className="login-info-panel">
          <h1 className="login-title">EcoBook Loop</h1>
          <p className="login-description">
            <strong>EcoBook Loop</strong> connects donors, recipients, and paper mills.
            Donate books, request reading materials, or recycle with ease.
          </p>
        </div>

        <div className="login-container">
          <h2 className="login-subtitle">Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="login-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="login-input"
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          {error && <p className="login-error">{error}</p>}

          <p className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>

          <p className="signup-link">
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
