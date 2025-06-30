import { useState, useEffect, useCallback } from "react";
import { Button } from "./Ui";
import EBookLogo from '/EcobookLO.jpg';
import { FaBell, FaUserCircle, FaDollarSign, FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../App.css';

export default function Navbar({ activeTab, setActiveTab, onNotificationsClick, logout, user }) {
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [showBonusDropdown, setShowBonusDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bonusSum, setBonusSum] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const toggleAvatarDropdown = () => setShowAvatarDropdown(!showAvatarDropdown);
  const toggleBonusDropdown = () => setShowBonusDropdown(!showBonusDropdown);

  const onBonusClick = () => setShowBonusDropdown(!showBonusDropdown);

  const fetchBonusSum = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/payments/bonusSum', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBonusSum(res.data.sum ?? 0);
    } catch (err) {
      console.error('Error fetching bonus sum:', err);
    }
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notifications = res.data;
      const count = notifications.filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchBonusSum();
    fetchUnreadCount();
  }, [fetchBonusSum, fetchUnreadCount]);

  return (
    <nav className="custom-navbar">
      <div className="nav-left">
        <div className="logo-section" onClick={() => navigate('/dashboard')}>
          <img src={EBookLogo} alt="EcoBook Logo" />
          <span className="logo-text">EcoBook</span>
        </div>

        <div className="nav-tabs">
          <Button variant={activeTab === 'donate' ? 'primary' : 'outline'} onClick={() => setActiveTab('donate')}>Donate/Receive</Button>
          <Button variant={activeTab === 'recycle' ? 'primary' : 'outline'} onClick={() => setActiveTab('recycle')}>Find Recyclables</Button>
          <Button variant={activeTab === 'activity' ? 'primary' : 'outline'} onClick={() => setActiveTab('activity')}>My Activity</Button>
        </div>
      </div>

      <div className="nav-right">
        
        {/* Notification Icon with Badge */}
        <button className="icon-button notif-icon" onClick={onNotificationsClick}>
          <FaBell />
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>

        <div className="bonus-container">
          <button className="icon-button" onClick={onBonusClick}>
            <FaDollarSign />
          </button>

          {showBonusDropdown && (
            <div className="bonus-dropdown">
              <p>Your Bonus: Ksh {bonusSum ?? 0}</p>
            </div>
          )}
        </div>

        <div className="avatar-container">
          <button className="icon-button avatar-button" onClick={toggleAvatarDropdown}><FaUserCircle /></button>
          {showAvatarDropdown && (
            <div className="avatar-dropdown">
              <p>Welcome {user?.name ?? 'User'}</p>
              <p onClick={logout} className="logout-option">Logout</p>
            </div>
          )}
        </div>

        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>

      <FaBars className="menu-icon" onClick={() => setMenuOpen(!menuOpen)} />

      {menuOpen && (
        <div className="collapsed-menu">
          <Button onClick={() => { setActiveTab('donate'); setMenuOpen(false); }}>Donate/Receive</Button>
          <Button onClick={() => { setActiveTab('recycle'); setMenuOpen(false); }}>Find Recyclables</Button>
          <Button onClick={() => { setActiveTab('activity'); setMenuOpen(false); }}>My Activity</Button>
          <Button onClick={onNotificationsClick}>Notifications</Button>
          <Button onClick={toggleBonusDropdown}>Bonus</Button>
          <Button onClick={logout}>Logout</Button>
        </div>
      )}
    </nav>
  );
}
