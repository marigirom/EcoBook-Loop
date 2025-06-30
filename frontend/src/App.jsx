import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notification';
import PaperMill from './pages/Papermill';
import EcoPay from './pages/EcoPay';
import ForgotPassword from './pages/forgotPassword';

import './App.css';
import PrivateRoute from './contexts/PrivateRoute';

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/papermill"
            element={
              <PrivateRoute>
                <PaperMill />
              </PrivateRoute>
            }
          />
          <Route
            path="/ecopay"
            element={
              <PrivateRoute>
                <EcoPay />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>

      <footer className="footer">
        &copy; 2025 EcoBook Loop. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
