import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { api } from '../services/api';
import Navbar from "../components/ui/Navbar";

import '../App.css';
import '../ecopay.css';

export default function PaperMill() {

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  const [activeTab, setActiveTab] = useState('recycle');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch recyclable requests
  const fetchRequests = async () => {
    try {
      const res = await api.get('http://localhost:5000/inventory/OutgoingRequest');
      setRequests(res.data.requests);
    } catch {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Schedule pickup for recyclable material
  const schedulePickup = async (requestId) => {
    const date = prompt('Enter pickup date (YYYY-MM-DD):');
    if (!date) return;

    const pickupLocation = prompt('Enter pickup location:');
    if (!pickupLocation) return;

    try {
      await api.post('http://localhost:5000/schedule/newSchedule', {
        requestId,
        scheduledDate: date,
        pickupLocation
      });
      fetchRequests();
      alert('Pickup scheduled and donor notified.');
    } catch {
      alert('Failed to schedule pickup');
    }
  };

  // Mark item as received, triggers donor notification
  const submitMarkRecyclableReceived = async (reqId) => {
    try {
      await axios.patch('http://localhost:5000/notifications/requestStatus', {
        requestId: reqId,
        status: 'Delivered'
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchRequests();
      alert('Item marked as received. Proceeding to bonus payment.');
      window.location.href = '/ecopay';
    } catch (err) {
      console.error('Error marking item as received:', err);
      alert('Failed to mark as received.');
    }
  };

  // Download activity report
  const downloadReport = async () => {
    try {
      const res = await api.get('http://localhost:5000/inventory/materialrequests/papermill/report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      setReportUrl(url);
    } catch {
      alert('Failed to generate report');
    }
  };

  // Navigation Handlers for tab changing
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'donate') navigate('/dashboard');
    if (tab === 'recycle') navigate('/dashboard');
    if (tab === 'activity') navigate('/dashboard');
  };

  const handleNotificationsClick = () => navigate('/notifications');
  const handleBonusClick = () => navigate('/ecopay');
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <p className="notif-loading">Loading requests...</p>;
  if (error) return <p className="notif-error">{error}</p>;

  return (
    <div className="layout-wrapper">

      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onNotificationsClick={handleNotificationsClick}
        onBonusClick={handleBonusClick}
        logout={handleLogout}
      />

      <h2 className="papermill-header">Paper Mill</h2>

      {/* Request Cards-showing requests made */}
      <div className="card-section">
        {requests.length === 0 ? (
          <p className="notif-empty">No recyclable requests found.</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="custom-card">
              <h5>{req.material?.title || 'Material'}</h5>

              <div className="custom-card-content">
                <p>Copies: {req.material?.copies}</p>
                <p>Category: {req.material?.category}</p>
                <p>Location: {req.material?.location}</p>
                <p>Status: {req.status}</p>
              </div>

              {req.status === 'Pending' && (
                <button className="custom-btn" onClick={() => schedulePickup(req.id)}>
                  Schedule Pickup
                </button>
              )}

              {req.status === 'Initiated-delivery' && (
                <p className="info-text">Pickup Scheduled. Awaiting Donor Confirmation.</p>
              )}

              {req.status === 'In-transit' && (
                <button className="custom-btn" onClick={() => submitMarkRecyclableReceived(req.id)}>
                  Mark as Received
                </button>
              )}

              {req.status === 'Delivered' && (
                <>
                  <p className="success-text">Delivery Complete. Proceed to Bonus Payment.</p>
                  <button className="custom-btn" onClick={() => navigate('/ecopay')}>
                    EcoPay - Bonus Payment
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Report Download Section */}
      <div className="custom-card report-card">
        <h3>Download Activity Report</h3>
        <button className="custom-btn" onClick={downloadReport}>Generate Report</button>

        {reportUrl && (
          <a
            href={reportUrl}
            download="activity_report.csv"
            className="custom-btn"
            style={{ marginLeft: '1rem' }}
          >
            Click to Download
          </a>
        )}
      </div>
      
    </div>
  );
}
