import { useState } from "react";
import { Button } from "./Ui";
import { FaBell, FaDollarSign, FaUserCircle } from "react-icons/fa";
import '../../App.css';

export default function Navbar({ activeTab, setActiveTab, onNotificationsClick, onBonusClick, logout }) {
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);

  const toggleAvatarDropdown = () => {
    setShowAvatarDropdown(!showAvatarDropdown);
  };

  return (
    <nav className="custom-navbar">
      <div className="nav-left">
        <span className="logo">EcoBook</span>
        <div className="nav-tabs">
          <Button variant={activeTab === 'donate' ? 'primary' : 'outline'} onClick={() => setActiveTab('donate')}>Donate/Receive</Button>
          <Button variant={activeTab === 'recycle' ? 'primary' : 'outline'} onClick={() => setActiveTab('recycle')}>Find Recyclables</Button>
          <Button variant={activeTab === 'activity' ? 'primary' : 'outline'} onClick={() => setActiveTab('activity')}>My Activity</Button>
        </div>
      </div>

      <div className="nav-right">
        <button className="icon-button" onClick={onNotificationsClick}><FaBell /></button>
        <button className="icon-button" onClick={onBonusClick}><FaDollarSign /></button>
        <div className="avatar-container">
          <button className="icon-button avatar-button" onClick={toggleAvatarDropdown}><FaUserCircle /></button>
          {showAvatarDropdown && (
            <div className="avatar-dropdown">
              <p>User Profile</p>
              <p>Settings</p>
              <p onClick={logout} style={{ cursor: 'pointer' }}>Logout</p>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
    </nav>
  );
}
