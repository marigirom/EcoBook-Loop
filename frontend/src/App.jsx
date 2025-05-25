import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useAuth } from './contexts/AuthContext';

import './App.css';

function App() {
  const { isAuthenticated } = useAuth();
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
          element={isAuthenticated ? <Dashboard/> : <Navigate to="/Login"/>}
        />
      </Routes>
    </Router>
  );
}

export default App;
