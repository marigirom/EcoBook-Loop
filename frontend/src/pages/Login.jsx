/*import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

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
      alert('Logged in successfully');
      navigate('/dashboard'); // Redirect to main dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>EcoBook Loop</h1>
      <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '2rem', textAlign: 'center' }}>
        <strong>EcoBook Loop</strong> is a smart, community-driven platform designed to connect donors, 
        recipients, and paper mills. Whether you're donating used books, requesting reading materials, or 
        collecting recyclables for industrial reuse, this platform enables easy listing, searching, requesting, 
        scheduling, and incentive tracking — all in one place.
      </p>

      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}>
          Login
        </button>
      </form>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>
      )}
    </div>
  );
}*/

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

import '../App.css'; // Custom global styles

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
      alert('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-wrapper">
      {/* Top Nav */}
      <nav className="login-navbar">
        <span className="login-logo">EcoBook</span>
        <Link to="/register" className="signup-nav-link">Sign Up</Link>
      </nav>

      {/* Main Grid */}
      <div className="login-grid">
        {/* Info Panel */}
        <div className="login-info-panel">
          <h1 className="login-title">EcoBook Loop</h1>
          <p className="login-description">
            <strong>EcoBook Loop</strong> is a smart, community-driven platform designed to connect donors, 
            recipients, and paper mills. Whether you're donating used books, requesting reading materials, or 
            collecting recyclables for industrial reuse, this platform enables easy listing, searching, requesting, 
            scheduling, and incentive tracking — all in one place.
          </p>
        </div>

        {/* Login Card */}
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

          <p className="signup-link">
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}


