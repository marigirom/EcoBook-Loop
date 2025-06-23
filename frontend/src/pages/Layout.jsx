import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui/Ui';
import { FaBell, FaUserCircle, FaDollarSign } from 'react-icons/fa';
//import {jwtDecode} from 'jwt-decode';
import ModalRenderer from '../components/ui/Modals';
import '../app.css';

const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret'];

const Layout = () => {
  const { token, logout } = useAuth();
//const decoded = token ? jwtDecode(token): {};
//const userId = decoded.userId;


  const [activeTab, setActiveTab] = useState('donate');
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleAvatarDropdown = () => setShowAvatarDropdown(!showAvatarDropdown);
  //const onNotificationsClick = () => alert('Open notifications panel');
   const onNotificationsClick = () => navigate('/Notifications');
  const onBonusClick = () => alert('Show bonus info');
  //notifications
  const notifications = [
    { message: 'Requests approved for Book'},
    { message: 'Pickup scheduled for recyclable'},
    { message: 'Bonus earned: Ksh 100'}
  ];

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  //  Updated request section
 const [requests, setRequests] = useState([]); // For donor-owned material requests
const [requestedBooks, setRequestedBooks] = useState([]); // For recipient's requested books
const [searchResults, setSearchResults] = useState([]);
const [materialsSearchResults, setMaterialsSearchResults] = useState([]);
const [selectedMaterials, setSelectedMaterials] = useState([]);
const [requestedMaterials, setRequestedMaterials ] = useState([]);
const [availableBooks, setAvailableBooks] = useState([]);
const[availableItems, setAvailableItems] = useState([]);

  const [bookForm, setBookForm] = useState({ type: 'book', title: '', condition: 'new', location: locations[0] });
  const [itemForm, setItemForm] = useState({ category: 'Magazine', copies: '', location: locations[0] });
  const [formState, setformState] = useState({ title: '', location: locations[0] });
  const [materialSearchForm, setMaterialSearchForm] = useState({ location: locations[0] });

  const [listedBooks, setListedBooks] = useState([]);
  const [listedItems, setListedItems] = useState([]);

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const handleModal = (type) => {
    setModalContent(type);
    setShowModal(true);
  };
//import { useCallback, useEffect } from 'react';

// FETCH LISTED MATERIALS (Your own)
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

// FETCH AVAILABLE MATERIALS (From others)
const fetchAvailableMaterials = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/inventory/availableMaterials', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const all = res.data.materials;

    // Only filter recyclables by .available
    setAvailableBooks(all.filter(item => item.type === 'book'));

    setAvailableItems(all.filter(item => item.type !== 'book' && item.available !== false));
  } catch (err) {
    console.error('Failed to fetch available materials:', err);
  }
}, [token]);


// FETCH INCOMING REQUESTS (To your listings)
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

// FETCH BOOKS YOU REQUESTED
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

// FETCH RECYCLABLES YOU REQUESTED
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

// RUN FETCHES ON MODAL LOAD
useEffect(() => {
  if (modalContent === 'searchBook' || modalContent === 'searchMaterials') {
    fetchAvailableMaterials();
  } else if (modalContent === 'viewListed') {
    fetchListedMaterials();
  } else if (modalContent === 'myRequestedBooks') {
    fetchRequestedBooks();
  } else if (modalContent === 'viewMillRequests') {
    fetchRequestedRecyclables();
  } else if (modalContent === 'viewRequests') {
    fetchRequests();
  }
}, [
  modalContent,
  fetchListedMaterials,
  fetchAvailableMaterials,
  fetchRequestedBooks,
  fetchRequestedRecyclables,
  fetchRequests,
]);

// LIST NEW BOOK
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

// LIST NEW RECYCLABLE
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

// SEARCH FOR A BOOK
const submitSearchBook = (e) => {
  e.preventDefault();
  const filtered = availableBooks.filter(b =>
    b.location === formState.location &&
    b.title.toLowerCase().includes(formState.title.toLowerCase())
  );
  setSearchResults(filtered);
};

// REQUEST A BOOK (Only if still available)
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


// STATUS FOR YOUR BOOK LISTINGS
const booksWithStatus = listedBooks.map(book => {
  const match = requests.find(r => r.material?.id === book.id);
  return { ...book, status: match?.status || 'Not requested yet' };
});



/*For thi  the donor's 'view requests' modal needs a small button to 'deliver' requested book after 
which notification is sent to recipient that book will be dispatched in 2 days, request status is updated to initiated delivery*/
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


/*For the below chunk , in 'myrequests' card modal beside each book, a button to mark received
and notification sent to donor that book has been delivered successfully and request status updated to delivered from initiated deleivery*/
//pending
const submitMarkReceived = async (reqId) => {
  try {
    await axios.patch('http://localhost:5000/inventory/requestStatus', {
      requestId: reqId,
      status: 'Delivered'
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    await fetchRequests();       // Refresh recipient's request list
    await fetchRequestedBooks(); // Refresh their requested books
    alert('Marked as received.');
  } catch (err) {
    console.error('Error marking as received:', err);
    alert('Failed to mark as received.');
  }
};


// 🔍 Search for recyclable materials by location
const submitSearchMaterials = (e) => {
  e.preventDefault();
  const filtered = availableItems.filter(item =>
    item.location === materialSearchForm.location && item.available !== false
  );
  setMaterialsSearchResults(filtered);
};

//  Toggle material selection (select or deselect)
const toggleSelectMaterial = (id) => {
  setSelectedMaterials(prev =>
    prev.includes(id)
      ? prev.filter(mid => mid !== id) // Deselect
      : [...prev, id]                  // Select
  );
};

// Submit recyclable material requests
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

    // Feedback to user
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

//for the above chunk, the database is updated, but papermill can't view their requested materials'items to recycle'

/**Here the papermill page will handle this */
  const submitMarkRecyclableReceived = submitMarkReceived;
  
  const submitSchedulePickup = submitDeliverRequest;

  


  return (
    <div className="layout-wrapper">
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

      {activeTab === 'donate' && (
        <>
          <h4 className="section-title">Are you donating?</h4>
          <div className="grid-container">
            <Card><h5>Donate Books</h5><Button onClick={() => handleModal('listBook')}>List Book</Button><Button variant="outline" onClick={() => handleModal('viewListed')}>View Listed</Button></Card>
            <Card><h5>List Recyclables</h5><Button onClick={() => handleModal('listItem')}>List Item</Button></Card>
            <Card><h5>View Requests</h5><Button onClick={() => handleModal('viewRequests')}>View Requests</Button></Card>
            <Card><h5>Check Status</h5><Button onClick={() => handleModal('viewStatus')}>View Status</Button></Card>
          </div>

          <h4 className="section-title">Searching for a book?</h4>
          <div className="grid-container">
            <Card><h5>Search Book</h5><Button onClick={() => handleModal('searchBook')}>Search</Button></Card>
            <Card><h5>My Requested Books</h5><Button onClick={() => handleModal('myRequestedBooks')}>View</Button></Card>
          </div>
        </>
      )}

     

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
        <Button onClick={() => handleModal('viewMillRequests')}>viewRequests</Button>
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


      {activeTab === 'activity' && (
        <><h4 className='section-title'>My Activity</h4>
        <div className='grid-container'>
          <Card>
            <h5>Bonus Earned</h5><Button onClick={() =>
              navigate('ecopay')}>View Bonuses</Button>
          </Card>
          <Card><h5>All Deliveries</h5>
          <p className="card-link" onClick={() => handleModal('viewDonorDeliveries')}>For my donated items</p>
          <p className="card-link" onClick={() => handleModal('viewMillDeliveries')}>Mill: View delivery status for my requested materials</p>
        </Card>
        <Card><h5>Delete Listings</h5><Button onClick={() => handleModal('viewListed')}>Manage My Listings</Button></Card>
        <Card><h5>Summary</h5><Button onClick={() => handleModal('viewSummary')}>View Summary</Button></Card>
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
                locations={locations}
                listedBooks={booksWithStatus}
                listedItems={listedItems}
                availableBooks={availableBooks}
                availableItems={availableItems}
                requests={requests}
                requestedBooks={requestedBooks}
                searchResults={searchResults}
                materialsSearchResults={materialsSearchResults}
                selectedMaterials={selectedMaterials}
                requestedMaterials={requestedMaterials}
                //requestedMaterials={requestedMaterials}
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
                onSubmit={
                  modalContent === 'listBook' ? submitListBook :
                  modalContent === 'listItem' ? submitListItem :
                  modalContent === 'searchBook' ? submitSearchBook :
                  submitSearchMaterials
                }
                onRequestBook={submitRequestBook}
                onDeliverRequest={submitDeliverRequest}
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