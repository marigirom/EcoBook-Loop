import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, Button, Avatar } from '../components/ui/ui';

const Layout = () => {
  const [activeTab, setActiveTab] = useState('donate');
  const { logout } = useAuth();

  const renderDonateReceive = () => (
    <>
      <h4 className="mt-4">Are you a donor?</h4>
      <div className="row mt-3">
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <h5>Donate Books</h5>
              <p>Title, Condition, Location</p>
              <Button>List Book</Button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <h5>List Recyclables</h5>
              <p>Category, Count, Location</p>
              <Button>List Materials</Button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <h5>View Requests</h5>
              <p>Books & Recycle Material</p>
              <Button>Pickup & Deliver</Button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <h5>Check Status</h5>
              <p>Pending, Delivered, Tracking</p>
              <Button>View Status</Button>
            </div>
          </div>
        </div>
      </div>

      <h4 className="mt-5">Are you searching for a book?</h4>
      <div className="row mt-3">
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <h5>Search Book</h5>
              <p>By Title & Location</p>
              <Button>Search</Button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <h5>My Requested Books</h5>
              <p>Track delivery</p>
              <Button>View</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderRecycle = () => (
    <>
      <h4 className="mt-4">Are you looking for recyclable materials?</h4>
      <div className="row mt-3">
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <h5>Search for Materials</h5>
              <p>By location</p>
              <Button>Search Materials</Button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-body">
              <h5>Delivery Status</h5>
              <p>Track, Confirm, Bonus</p>
              <Button>Track Delivery</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="container py-4">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm rounded mb-4">
        <div className="container-fluid">
          <span className="navbar-brand text-success fw-bold">EcoBook</span>

          <div className="d-flex align-items-center gap-3">
            <button
              className={`btn btn-sm ${activeTab === 'donate' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('donate')}
            >
              Donate/Receive
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'recycle' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('recycle')}
            >
              Find to Recycle
            </button>

            <div className="dropdown ms-3">
              <Avatar
                className="dropdown-toggle cursor-pointer"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              />
              <ul className="dropdown-menu dropdown-menu-end">
                <li><span className="dropdown-item">My Profile</span></li>
                <li><span className="dropdown-item">My Bonuses</span></li>
                <li><span className="dropdown-item">Donated Items</span></li>
                <li><span className="dropdown-item">Received Items</span></li>
              </ul>
            </div>

            <button className="btn btn-outline-danger btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Content */}
      {activeTab === 'donate' ? renderDonateReceive() : renderRecycle()}
    </div>
  );
};

export default Layout;
