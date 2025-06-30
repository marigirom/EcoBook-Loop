import EBookLogo from '/EcobookLO.jpg';
import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui/Ui';
import { FaBell, FaUserCircle, FaDollarSign, FaBars } from 'react-icons/fa';
// import {jwtDecode} from 'jwt-decode';
import ModalRenderer from '../components/ui/Modals';

import '../app.css';

// Default locations used in forms
const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret'];

const Layout = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // UI State
  const [activeTab, setActiveTab] = useState('donate');
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [showBonusDropdown, setShowBonusDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Material & Request State
  const [requests, setRequests] = useState([]); 
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [requestedMaterials, setRequestedMaterials] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [materialsSearchResults, setMaterialsSearchResults] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  // User, Listings & Summary State
  const [bonusSum, setBonusSum] = useState(0);
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

  // Form State
  const [bookForm, setBookForm] = useState({
    type: 'book',
    title: '',
    condition: 'new',
    location: locations[0]
  });

  const [itemForm, setItemForm] = useState({
    category: 'Magazine',
    copies: '',
    location: locations[0]
  });

  const [formState, setformState] = useState({
    title: '',
    location: locations[0]
  });

  const [materialSearchForm, setMaterialSearchForm] = useState({
    location: locations[0]
  });

  const [listedBooks, setListedBooks] = useState([]);
  const [listedItems, setListedItems] = useState([]);

  // Dropdown & Modal Controls
  const toggleAvatarDropdown = () => setShowAvatarDropdown(!showAvatarDropdown);
  const toggleBonusDropdown = () => setShowBonusDropdown(!showBonusDropdown);
  const onNotificationsClick = () => navigate('/Notifications');

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const handleModal = (type) => {
    if (type === 'viewBonuses') fetchBonusSum();
    if (type === 'manageListings') fetchListings();
    if (type === 'viewSummary') fetchSummary();

    setModalContent(type);
    setShowModal(true);
  };

//FETCH FUNCTIONS

// Fetch materials listed by the user
const fetchListedMaterials = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/inventory/materials', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const all = res.data.materials;
    setListedBooks(all.filter(item => item.type === 'book'));
    setListedItems(all.filter(item => item.type !== 'book'));
  } catch (err) {
    console.error('Failed to fetch materials:', err);
  }
}, [token]);

// Fetch available materials listed by others
const fetchAvailableMaterials = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/inventory/availableMaterials', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const all = res.data.materials;
    setAvailableBooks(all.filter(item => item.type === 'book'));
    setAvailableItems(all.filter(item => item.type !== 'book' && item.available !== false));
  } catch (err) {
    console.error('Failed to fetch available materials:', err);
  }
}, [token]);

// Fetch incoming requests for user's listed materials
const fetchRequests = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/inventory/incomingRequest', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const formatted = res.data.requests.map(req => ({
      id: req.id,
      title: req.material?.title || 'Untitled',
      type: req.material?.type || 'Unknown',
      category: req.material?.category || 'N/A',
      copies: req.material?.copies ?? 1,
      status: req.status,
      requestedBy: req.name || 'Unknown',
      material: req.material
    }));
    setRequests(formatted);
  } catch (err) {
    console.error('Failed to fetch requests:', err);
  }
}, [token]);

// Fetch books the user has requested
const fetchRequestedBooks = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/inventory/BookRequest', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const books = res.data.requests.map(req => ({
      id: req.id,
      title: req.material?.title || 'Untitled',
      status: req.status,
    }));
    setRequestedBooks(books);
  } catch (err) {
    console.error('Error fetching requested books:', err);
    alert('Failed to fetch your requested books');
  }
}, [token]);

// Fetch recyclables the user has requested
const fetchRequestedRecyclables = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/inventory/OutgoingRequest', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const materials = res.data.requests.map(req => ({
      id: req.id,
      category: req.material?.category || 'Unknown',
      copies: req.material?.copies ?? 1,
      location: req.material?.location || 'N/A',
      status: req.status,
    }));
    setRequestedMaterials(materials);
  } catch (err) {
    console.error('Error fetching requested recyclables:', err);
    alert('Failed to fetch requested recyclables');
  }
}, [token]);

// Fetch user's bonus sum (for completed deliveries)
const fetchBonusSum = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/payments/bonusSum', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sum = res.data.sum ?? 0;
    setBonusSum(sum);
  } catch (err) {
    console.error('Error fetching bonus sum:', err);
    alert('Failed to fetch bonus sum');
  }
}, [token]);

// Fetch user's own listed materials summary
const fetchListings = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/inventory/myListings', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listings = res.data.listings.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title || null,
      category: item.category || null,
      status: item.status || 'Unknown',
      location: item.location || 'N/A'
    }));
    setListings(listings);
  } catch (err) {
    console.error('Error fetching listings:', err);
    alert('Failed to fetch listings');
  }
}, [token]);

// Fetch delivery/received summary
const fetchSummary = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/inventory/summary', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const summary = res.data.summary.map(entry => ({
      type: entry.type,
      title: entry.title || null,
      category: entry.category || null,
      deliveredAt: entry.deliveredAt || null,
      receivedAt: entry.receivedAt || null
    }));
    setSummaryData(summary);
  } catch (err) {
    console.error('Error fetching summary:', err);
    alert('Failed to fetch summary');
  }
}, [token]);

// Fetch user profile info
const fetchProfile = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = {
      id: res.data.user.id,
      name: res.data.user.name || '',
      email: res.data.user.email || '',
      location: res.data.user.location || '',
    };
    setUser(userData);
  } catch (err) {
    console.error('Error fetching profile:', err);
    alert('Failed to fetch profile');
  }
}, [token]);

//useEffect

// Fetch bonus sum once on mount
useEffect(() => {
  fetchBonusSum();
}, [fetchBonusSum]);

// Fetch profile info once on mount
useEffect(() => {
  fetchProfile();
}, [fetchProfile]);

// Fetch notifications once on mount
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  fetchNotifications();
}, []);

// Re-fetch relevant data when specific modals are opened
useEffect(() => {
  if (modalContent === 'searchBook' || modalContent === 'searchMaterials') {
    fetchAvailableMaterials();
  } else if (modalContent === 'viewListed' || modalContent === 'manageListings') {
    fetchListedMaterials();
  } else if (modalContent === 'myRequestedBooks') {
    fetchRequestedBooks();
  } else if (modalContent === 'viewMillRequests') {
    fetchRequestedRecyclables();
  } else if (modalContent === 'viewRequests') {
    fetchRequests();
  } else if (modalContent === 'viewBonuses') {
    fetchBonusSum();
  } else if (modalContent === 'viewSummary') {
    fetchSummary();
  }
}, [
  modalContent,
  fetchListedMaterials,
  fetchAvailableMaterials,
  fetchRequestedBooks,
  fetchRequestedRecyclables,
  fetchRequests,
  fetchBonusSum,
  fetchSummary
]);


//LISTING MATERIALS 

// List a new book
const submitListBook = async (e) => {
  e.preventDefault();
  try {
    await axios.post('http://localhost:5000/inventory/materials', {
      ...bookForm,
      type: 'book',
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchListedMaterials();
    alert('Book listed successfully');
    closeModal();
  } catch (err) {
    console.error('Error listing book:', err);
    alert('Failed to list book');
  }
};

// List a new recyclable item
const submitListItem = async (e) => {
  e.preventDefault();
  try {
    await axios.post('http://localhost:5000/inventory/materials', {
      ...itemForm,
      type: 'recyclable',
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchListedMaterials();
    alert('Recyclable item listed successfully');
    closeModal();
  } catch (err) {
    console.error('Error listing item:', err);
    alert('Failed to list item');
  }
};



// SEARCH & REQUEST BOOKS 

// Search for available books
const submitSearchBook = (e) => {
  e.preventDefault();
  const filtered = availableBooks.filter(b =>
    b.location === formState.location &&
    b.title.toLowerCase().includes(formState.title.toLowerCase())
  );
  setSearchResults(filtered);
};

// Request a book (if still available)
const submitRequestBook = async (book) => {
  try {
    await axios.post('http://localhost:5000/inventory/newRequest', {
      materialId: book.id,
      type: 'book',
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await fetchAvailableMaterials();
    await fetchRequestedBooks();
    alert(`Requested "${book.title}" successfully`);
  } catch (err) {
    if (err.response?.data?.error) {
      alert(err.response.data.error);
    } else {
      console.error('Error requesting book:', err);
      alert('Failed to request book');
    }
  }
};



//MANAGE BOOK REQUEST STATUS

// Attach status to listed books based on incoming requests
const booksWithStatus = listedBooks.map(book => {
  const match = requests.find(r => r.material?.id === book.id);
  return { ...book, status: match?.status || 'Not requested yet' };
});

// Donor initiates delivery of requested book (notifies recipient)
const submitDeliverRequest = async (reqId) => {
  try {
    await axios.patch('http://localhost:5000/inventory/requestStatus', {
      requestId: reqId,
      status: 'In-transit'
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchRequests();
    alert('Recipient notified, Delivery is initiated');
  } catch (err) {
    console.error('Error updating delivery status:', err);
  }
};

// Recipient marks book as received (notifies donor)
const submitMarkReceived = async (reqId) => {
  try {
    await axios.patch('http://localhost:5000/inventory/requestStatus', {
      requestId: reqId,
      status: 'Delivered'
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    await fetchRequests();
    await fetchRequestedBooks();
    alert('Marked as received.');
  } catch (err) {
    console.error('Error marking as received:', err);
    alert('Failed to mark as received.');
  }
};



// MANAGE RECYCLABLE REQUESTS

// Donor marks recyclable as picked up (notifies paper mill)
const submitItemPickedUp = async (reqId) => {
  try {
    await axios.patch('http://localhost:5000/notifications/requestStatus', {
      requestId: reqId,
      status: 'In-transit'
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchRequests();
    alert('Paper mill notified, item is in transit.');
  } catch (err) {
    console.error('Error updating item to In-transit:', err);
    alert('Failed to update request status');
  }
};

// Search for recyclables by location
const submitSearchMaterials = (e) => {
  e.preventDefault();
  const filtered = availableItems.filter(item =>
    item.location === materialSearchForm.location && item.available !== false
  );
  setMaterialsSearchResults(filtered);
};

// Select or deselect recyclable materials
const toggleSelectMaterial = (id) => {
  setSelectedMaterials(prev =>
    prev.includes(id)
      ? prev.filter(mid => mid !== id)
      : [...prev, id]
  );
};

// Request selected recyclable materials
const submitRequestMaterials = async () => {
  if (selectedMaterials.length === 0) {
    alert('Please select materials to request.');
    return;
  }

  try {
    const results = await Promise.allSettled(
      selectedMaterials.map(id =>
        axios.post('http://localhost:5000/inventory/newRequest', {
          materialId: id,
          type: 'recyclable'
        }, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );

    const successful = results
      .filter(res => res.status === 'fulfilled')
      .map((_, index) => selectedMaterials[index]);

    const failed = results
      .filter(res => res.status === 'rejected')
      .map((res, index) => {
        const id = selectedMaterials[index];
        const msg = res.reason?.response?.data?.error || 'Request failed';
        console.warn(`Material ID ${id}: ${msg}`);
        return { id, msg };
      });

    if (successful.length > 0) {
      alert(`Successfully requested: ${successful.join(', ')}`);
    }

    if (failed.length > 0) {
      alert(`Some materials were not requested:\n${failed.map(f => `ID ${f.id}: ${f.msg}`).join('\n')}`);
    }

    await fetchAvailableMaterials();
    await fetchRequestedRecyclables();
    closeModal();
  } catch (err) {
    console.error('Unexpected error requesting materials:', err);
    alert('An error occurred while requesting materials.');
  }
};



//PAPERMILL REUSABLE HANDLERS 

// Papermill uses same mark as received and schedule pickup as books
const submitMarkRecyclableReceived = submitMarkReceived;
const submitSchedulePickup = submitDeliverRequest;



// DELETE LISTED MATERIAL

const deleteListing = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/inventory/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchListings();
  } catch (err) {
    console.error(err);
  }
};





return (
  <div className="layout-wrapper">

    {/* NAVIGATION BAR */}
    <nav className="custom-navbar">

      {/* Left Side - Logo & Tabs */}
      <div className="nav-left">
        <div className="logo-section" onClick={() => navigate('/dashboard')}>
          <img src={EBookLogo} alt="EcoBook Logo" />
          <span className="logo-text">EcoBook</span>
        </div>

        <div className="nav-tabs">
          <Button variant={activeTab === 'donate' ? 'primary' : 'outline'} onClick={() => setActiveTab('donate')}>
            Donate/Receive
          </Button>
          <Button variant={activeTab === 'recycle' ? 'primary' : 'outline'} onClick={() => setActiveTab('recycle')}>
            Find Recyclables
          </Button>
          <Button variant={activeTab === 'activity' ? 'primary' : 'outline'} onClick={() => setActiveTab('activity')}>
            My Activity
          </Button>
        </div>
      </div>

      {/* Right Side - Notifications, Bonus, Avatar, Logout */}
      <div className="nav-right">
        <button className="icon-button notif-icon" onClick={onNotificationsClick}>
          <FaBell />
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>

        <div className="bonus-container">
          <button className="icon-button bonus-button" onClick={toggleBonusDropdown}>
            <FaDollarSign />
          </button>
          {showBonusDropdown && (
            <div className="bonus-dropdown">
              <p>Your Bonus: Ksh {bonusSum ?? 0}</p>
            </div>
          )}
        </div>

        <div className="avatar-container">
          <button className="icon-button avatar-button" onClick={toggleAvatarDropdown}>
            <FaUserCircle />
          </button>
          {showAvatarDropdown && (
            <div className="avatar-dropdown">
              <p>Welcome {user?.name ?? 'User'}</p>
              <p onClick={logout}>Logout</p>
            </div>
          )}
        </div>

        <button className="logout-button" onClick={logout}>Logout</button>
      </div>

      {/* Mobile Menu Icon */}
      <FaBars className="menu-icon" onClick={() => setMenuOpen(!menuOpen)} />

      {/* Collapsed Menu for Mobile */}
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

    {/* DONATE/RECEIVE TAB */}
    {activeTab === 'donate' && (
      <>
        <h4 className="section-title">Are you donating?</h4>
        <div className="grid-container">
          <Card>
            <h5>Donate Books</h5>
            <Button onClick={() => handleModal('listBook')}>List Book</Button>
            <Button variant="outline" onClick={() => handleModal('viewListed')}>View Listed</Button>
          </Card>
          <Card>
            <h5>List Recyclables</h5>
            <Button onClick={() => handleModal('listItem')}>List Item</Button>
          </Card>
          <Card>
            <h5>View Requests</h5>
            <Button onClick={() => handleModal('viewRequests')}>View Requests</Button>
          </Card>
          <Card>
            <h5>Check Status</h5>
            <Button onClick={() => handleModal('viewStatus')}>View Status</Button>
          </Card>
        </div>

        <h4 className="section-title">Searching for a book?</h4>
        <div className="grid-container">
          <Card>
            <h5>Search Book</h5>
            <Button onClick={() => handleModal('searchBook')}>Search</Button>
          </Card>
          <Card>
            <h5>My Requested Books</h5>
            <Button onClick={() => handleModal('myRequestedBooks')}>View</Button>
          </Card>
        </div>
      </>
    )}

    {/* FIND RECYCLABLES TAB */}
    {activeTab === 'recycle' && (
      <>
        <h4 className="section-title">Find materials to recycle</h4>
        <div className="grid-container">
          <Card>
            <h5>Search Materials</h5>
            <p>Find available recyclable listings</p>
            <Button onClick={() => handleModal('searchMaterials')}>Search Materials</Button>
          </Card>

          <Card>
            <h5>My Requests</h5>
            <Button onClick={() => handleModal('viewMillRequests')}>View Requests</Button>
            <p>Track your requests</p>
            <Button onClick={() => navigate('/papermill')}>PaperMill</Button>
          </Card>

          <Card>
            <h5>My History</h5>
            <p>All materials requested</p>
            <Button onClick={() => handleModal('viewMillRequests')}>Request History</Button>
            <p>Bonus paid out</p>
            <Button onClick={() => navigate('/ecopay')}>View Bonuses</Button>
          </Card>
        </div>
      </>
    )}

    {/* MY ACTIVITY TAB */}
    {activeTab === 'activity' && (
      <>
        <h4 className="section-title">My Activity</h4>
        <div className="grid-container">
          <Card>
            <h5>Bonuses Earned</h5>
            <Button onClick={() => handleModal('viewBonuses')}>View Bonus</Button>
          </Card>
          <Card>
            <h5>Manage Listings</h5>
            <Button onClick={() => handleModal('manageListings')}>View Listings</Button>
          </Card>
          <Card>
            <h5>Summary</h5>
            <Button onClick={() => handleModal('viewSummary')}>View Summary</Button>
          </Card>
        </div>

        <div className="notification-panel">
          <h5>Notifications</h5>
          <ul className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((note, idx) => (
                <li key={idx} className="notification-item">{note.message}</li>
              ))
            ) : (
              <li className="notification-item">No new notifications</li>
            )}
          </ul>
        </div>
      </>
    )}

    {showModal && (
  <div className="modal show d-block" tabIndex="-1" onClick={closeModal}>
    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content p-4">

        <ModalRenderer
          modalType={modalContent}
          closeModal={closeModal}

          // Location & Listings
          locations={locations}
          listedBooks={booksWithStatus}
          listedItems={listedItems}
          listings={listings}
          fetchListings={fetchListings}
          deleteListing={deleteListing}

          // Available Materials
          availableBooks={availableBooks}
          availableItems={availableItems}

          // Requests & Results
          requests={requests}
          requestedBooks={requestedBooks}
          searchResults={searchResults}
          materialsSearchResults={materialsSearchResults}
          selectedMaterials={selectedMaterials}
          requestedMaterials={requestedMaterials}

          // Summary & Bonus
          summaryData={summaryData}
          fetchSummary={fetchSummary}
          bonusSum={bonusSum}
          fetchBonusSum={fetchBonusSum}

          // Form States
          formState={
            modalContent === 'listBook' ? bookForm :
            modalContent === 'listItem' ? itemForm :
            modalContent === 'searchBook' ? formState :
            materialSearchForm
          }
          setFormState={
            modalContent === 'listBook' ? setBookForm :
            modalContent === 'listItem' ? setItemForm :
            modalContent === 'searchBook' ? setformState :
            setMaterialSearchForm
          }

          // Handlers
          onSubmit={
            modalContent === 'listBook' ? submitListBook :
            modalContent === 'listItem' ? submitListItem :
            modalContent === 'searchBook' ? submitSearchBook :
            submitSearchMaterials
          }
          onRequestBook={submitRequestBook}
          onDeliverRequest={submitDeliverRequest}
          onItemPickedUp={submitItemPickedUp}
          onMarkReceived={submitMarkReceived}
          onToggleMaterial={toggleSelectMaterial}
          onRequestMaterials={submitRequestMaterials}
          onMarkMaterialReceived={submitMarkRecyclableReceived}
          onSchedulePickup={submitSchedulePickup}
        />

      </div>
    </div>
  </div>
)}
  </div>

  );
};

export default Layout