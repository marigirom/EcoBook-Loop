import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EBookLogo from '/EcobookLO.jpg';
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

      {/* Navbar */}
      <nav className="login-navbar">
        <div className="logo-section" onClick={() => navigate('/login')}>
          <img src={EBookLogo} alt="EcoBook Logo" />
          <span className="logo-text">EcoBook</span>
        </div>
        <Link to="/register" className="signup-nav-link">Sign Up</Link>
      </nav>

      {/* Main Grid */}
      <div className="login-grid">

        {/* Left Panel */}
        <div className="login-info-panel">
          <div className="split-image-circle"></div>

          <h1 className="login-title">EcoBook Loop</h1>
          <ul className="login-pointers">
            <li>Donate books you no longer need</li>
            <li>Request learning materials with ease</li>
            <li>Recycle paper and recyclable materials</li>
            <li>Earn bonuses for contributing recyclables</li>
            <li>Be part of Kenya's circular economy</li>
          </ul>
        </div>

        {/* Right Panel */}
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
