//Ecopay for bonus
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../services/api';
import Navbar from "../components/ui/Navbar";
import '../App.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default function EcoPay() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('recycle');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('50');
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const loggedInUserId = decoded?.id;

  const fetchRequests = useCallback(async () => {
  setLoading(true); // You should set loading at the top to avoid false UI state
  setError(null);
  try {
    const res = await api.get('http://localhost:5000/payments/PayRequests', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRequests(res.data.requests);
  } catch (err) {
    console.error('Error fetching EcoPay requests:', err);
    setError('Failed to load delivered requests');
  } finally {
    setLoading(false);
  }
}, [token]);


  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'donate') navigate('/dashboard');
    if (tab === 'recycle') navigate('/papermill');
    if (tab === 'activity') navigate('/dashboard');
  };

  const openBonusForm = (req) => {
    
    if (req.paid) {
    alert('Bonus already paid for this request.');
    return;
  }
    setSelectedRequest(req);
    setPaymentAmount('50');
    setShowForm(true);
  };

  const closeBonusForm = () => {
    setSelectedRequest(null);
    setPaymentAmount('50');
    setShowForm(false);
  };

  const processBonusPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/payments/bonus', {
        userId: selectedRequest.material?.user?.id,
        materialId: selectedRequest.material?.id,
        amount: parseInt(paymentAmount, 10),
        method: 'M-Pesa',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('STK Push initiated. User will approve on phone.');
      await fetchRequests();
      closeBonusForm();
    } catch (err) {
      console.error(err);
      alert('Failed to initiate STK Push.');
    }
  };

  const handleNotificationsClick = () => navigate('/notifications');
  const handleBonusClick = () => navigate('/ecopay');
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <p className="notif-loading">Loading delivered requests...</p>;
  if (error) return <p className="notif-error">{error}</p>;

  return (
    <div className="ecopay-wrapper">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onNotificationsClick={handleNotificationsClick}
        onBonusClick={handleBonusClick}
        logout={handleLogout}
      />

      <h2 className="ecopay-header">EcoPay - Bonus Disbursement</h2>
      <p className="subtitle">Disburse bonuses to users who listed materials.</p>

      <div className="card-section">
        {requests
          .filter(req => req.requester?.id === loggedInUserId)
          .map((req) => (
            <div key={req.id} className="custom-card">
              <h5>{req.material?.title || 'Recyclable Material'}</h5>
              <div className="custom-card-content">
                <p>Listed by: {req.material?.user?.name}</p>
                <p>Phone: {req.material?.user?.phone}</p>
                <p>Location: {req.material?.location}</p>
                <p>Bonus Amount: KES 50</p>
              </div>
              {req.paid ? (
                <button
                  className="custom-btn"
                  disabled
                  onClick={() => alert('Bonus already paid for this request.')}
                >
                  Bonus Paid
                </button>
              ) : (
                <button className="custom-btn" onClick={() => openBonusForm(req)}>
                  Pay Bonus
                </button>
              )}
            </div>
          ))}
      </div>

      {showForm && selectedRequest && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <h3>Bonus Payment - STK Push</h3>
            <p><strong>Account (Phone):</strong> {selectedRequest.material?.user?.phone}</p>
            <form onSubmit={processBonusPayment}>
              <label>
                Amount (KES):
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </label>
              <div className="form-actions">
                <button type="submit" className="custom-btn">Confirm Payment</button>
                <button type="button" className="cancel-btn" onClick={closeBonusForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
