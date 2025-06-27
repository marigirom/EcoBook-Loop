import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/auth/send-otp', { email });
      setMessage('OTP sent to your email. Check your inbox.');
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      setMessage('Password reset successful. You can now log in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="login-wrapper">
      <nav className="login-navbar">
        <span className="login-logo">EcoBook</span>
      </nav>

      <div className="login-grid">
        <div className="login-info-panel">
          <h1 className="login-title">EcoBook Loop</h1>
          <p className="login-description">
            {otpSent
              ? 'Enter the OTP sent to your email and set a new password.'
              : 'Enter your account email. If found, an OTP will be sent for password reset.'}
          </p>
        </div>

        <div className="login-container">
          <h2 className="login-subtitle">Forgot Password</h2>

          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              <input
                type="email"
                name="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
              <button type="submit" className="login-button">
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="login-input"
              />
              <input
                type="password"
                name="newPassword"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="login-input"
              />
              <button type="submit" className="login-button">
                Reset Password
              </button>
            </form>
          )}

          {message && <p className="login-success">{message}</p>}
          {error && <p className="login-error">{error}</p>}

          <p className="signup-link">
            Remembered your password? <a href="/">Back to Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
