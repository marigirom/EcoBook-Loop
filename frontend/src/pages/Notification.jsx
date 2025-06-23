import { useEffect, useState } from "react";
import { api } from '../services/api';
import '../App.css';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('http://localhost:5000/notifications');
                setNotifications(res.data);
                setLoading(false);
            } catch  {
                setError('Failed to load notifications');
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
    if (loading) return <p className="notif-loading">Loading notifications</p>
    if (error) return <p className="notif-error">{error}</p>

    return (
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
              {!notif.isRead && (
                <button
                  className="notif-btn"
                  onClick={() => markAsRead(notif.id)}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
    
}
