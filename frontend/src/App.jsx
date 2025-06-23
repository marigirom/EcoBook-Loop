import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notification';

import './App.css';
import PrivateRoute from './contexts/PrivateRoute';

function App() {
  
  return (
    <Router>
      <Routes>
        {/* Show Login on both '/' and '/login' */}
        <Route path="/" element={<Navigate to="/login"/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>} />
        {/*<Route path="/Dashboard" element={<Dashboard/>}/>}*/}
        <Route
          path="/dashboard"
          element={
           <PrivateRoute>
            <Dashboard/>
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
      </Routes>
    </Router>
  );
}

export default App;
