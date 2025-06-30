import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../services/api';
import Navbar from "../components/ui/Navbar";
import '../App.css';

export default function Notifications() {
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('activity');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('http://localhost:5000/notifications');
        setNotifications(res.data);
      } catch {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`http://localhost:5000/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      alert('Failed to update notifications');
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;

    try {
      await api.delete(`http://localhost:5000/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert('Failed to delete notification');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === 'donate') navigate('/dashboard');
    else if (tab === 'recycle') navigate('/papermill');
    else if (tab === 'activity') navigate('/notifications');
  };

  const handleNotificationsClick = () => navigate('/notifications');
  const handleBonusClick = () => navigate('/ecopay');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <p className="notif-loading">Loading notifications...</p>;
  if (error) return <p className="notif-error">{error}</p>;

  return (
    <div>
      
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onNotificationsClick={handleNotificationsClick}
        onBonusClick={handleBonusClick}
        logout={handleLogout}
      />

      <div className="notif-wrapper">
        <h2 className="notif-header">Your Notifications</h2>

        {notifications.length === 0 ? (
          <p className="notif-empty">You have no notifications.</p>
        ) : (
          <div className="notif-list">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-card ${notif.isRead ? 'read' : 'unread'}`}
              >
                <p className="notif-message">{notif.message}</p>
                <p className="notif-timestamp">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>

                <div className="notif-actions">
                  {!notif.isRead && (
                    <button
                      className="notif-btn"
                      onClick={() => markAsRead(notif.id)}
                    >
                      Mark as Read
                    </button>
                  )}

                  <button
                    className="notif-btn delete"
                    onClick={() => deleteNotification(notif.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
