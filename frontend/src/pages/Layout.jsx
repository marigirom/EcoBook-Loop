
import React, { useState,useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, Button, Avatar } from '../components/ui/Ui';
import { FaBell, FaUserCircle, FaDollarSign } from 'react-icons/fa';

//const { token } = useAuth();

import axios from 'axios';
import { useEffect } from 'react';
//import api from '../services/api'; // Adjust the path as needed

import ModalRenderer from '../components/ui/Modals';
import '../app.css';

const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret'];

const Layout = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('donate');
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const { logout } = useAuth();

   const toggleAvatarDropdown = () => setShowAvatarDropdown(!showAvatarDropdown);
  const onNotificationsClick = () => alert('Open notifications panel');
  const onBonusClick = () => alert('Show bonus info')

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);


  const [requests, setRequests] = useState([]);
  //const [statusList,] = useState([]);
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [materialsSearchResults, setMaterialsSearchResults] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const [bookForm, setBookForm] = useState({ type: 'book', title: '', condition: 'new', location: locations[0] });
  console.log('sending:', {
    ...bookForm,
    type: 'book'
  });
  const [itemForm, setItemForm] = useState({ category: 'Magazine', copies: '', location: locations[0] });
  const [searchForm, setSearchForm] = useState({ title: '', location: locations[0] });
  const [materialSearchForm, setMaterialSearchForm] = useState({ location: locations[0] });

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const handleModal = (type) => {
    setModalContent(type);
    setShowModal(true);
  };

 //***BOOK AND ITEM LISTING***//
  const [listedBooks, setListedBooks] = useState([]);
const [listedItems, setListedItems] = useState([]);

//FetchBooks$Items**

const fetchListedMaterials = useCallback(async () => {
  try {
    const res = await axios.get('http://localhost:5000/inventory/materials', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const all = res.data.materials;
    setListedBooks(all.filter(item => item.type === 'book'));
    setListedItems(all.filter(item => item.type !== 'book'));
  } catch (err) {
    console.error('Failed to fetch materials:', err);
  }
}, [token]);
useEffect(() => {
  
  fetchListedMaterials();
}, [fetchListedMaterials]);


//Listing BOOKS*
const submitListBook = async (e) => {
  e.preventDefault();
  try {
    //await api.post('/inventory/materials', {
    await axios.post('http://localhost:5000/inventory/materials', {
      ...bookForm,
      type: 'book',
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchListedMaterials(); // refresh
    alert('Book listed successfully');
    closeModal();
  } catch (err) {
    console.error('Error listing book:', err);
    alert('Failed to list book');
  }
};
//Listing ITEMS*
const submitListItem = async (e) => {
  e.preventDefault();
  try {
    //await api.post('/inventory/materials', {
    await axios.post('http://localhost:5000/inventory/materials', {
      ...itemForm,
      type: 'recyclable',
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchListedMaterials(); // refresh
    alert('Recyclable item listed successfully');
    closeModal();
  } catch (err) {
    console.error('Error listing item:', err);
    alert('Failed to list item');
  }
};
//to view the status
const booksWithStatus = listedBooks.map(book => {
  const matchingRequest = requests.find(r => r.title === book.title);
  return {
    ...book,
    status: matchingRequest?.status || 'Not requested yet',
  };
});

//Recipients' section
//search BOOK**
  const submitSearchBook = (e) => {
    e.preventDefault();
    const filtered = listedBooks.filter(
      (b) =>
        b.location === searchForm.location &&
        b.title.toLowerCase().includes(searchForm.title.toLowerCase())
    );
    setSearchResults(filtered);
  };
//request Book*
  const submitRequestBook = (book) => {
    //setRequests([...requests, {
    const newRequest = {
      id: Date.now(),
      type: 'book',
      title: book.title,
      requestedBy: `You - ${book.location}`,
      status: 'Pending',
    };

    setRequests(prev => [...prev, newRequest]);

    setRequestedBooks(prev => [...prev, {
      id: newRequest.id,
      title: book.title,
      status: 'Pending',
    }]);
    alert(`Requested "${book.title}"`);
  };
//donor initiates delivery
//Deliver to recipient**
      //const submitDeliverRequest = (reqId) => {
        //setRequests(requests.map((r) =>
          //r.id === reqId ? { ...r, status: 'Initiated delivery' } : r
        //));
        //alert('Recipient notified. Delivery initiated.');
      //};
  const submitDeliverRequest = (reqId) => {
    //donor's**
    setRequests(prev => 
      prev.map((r) =>
      r.id ===reqId ? { ...r, status: 'Delivery Initiated' } : r
      )
    );
    //recipient's
    setRequestedBooks(prev =>
      prev.map((b) => 
      b.id === reqId ? { ...b, status: 'Delivery Initiated'} : b
      )
    );
    alert('Recipient notified, Delivery is initiated');
  };
//missing the recipients' requests

//once the book is received
  const submitMarkReceived = (bookId) => {
    setRequestedBooks(requestedBooks.map((b) =>
      b.id === bookId ? { ...b, status: 'Delivered' } : b
    ));
    setRequests(requests.map((r) =>
    r.id === bookId ? { ...r, status: 'Delivered'} : r
    ));
    alert('Marked as received.');
  };

//search material
//search ITEM** & requests**
  const submitSearchMaterials = (e) => {
    e.preventDefault();
    const filtered = listedItems.filter(i => i.location === materialSearchForm.location);
    setMaterialsSearchResults(filtered);
  };
//select material to recycle
  const toggleSelectMaterial = (id) => {
    setSelectedMaterials(
      selectedMaterials.includes(id)
        ? selectedMaterials.filter((mid) => mid !== id)
        : [...selectedMaterials, id]
    );
  };
//submit materials to recycle**
  const submitRequestMaterials = () => {
    if (selectedMaterials.length === 0) {
      alert('Please select materials');
      return;
    }
    alert(`Requested materials with IDs: ${selectedMaterials.join(', ')}`);
    closeModal();
  };

  return (
    <div className="layout-wrapper">

   {/* Navbar */}
<nav className="custom-navbar">
  {/* LEFT:navbar */}
  <div className="nav-left">
    <span className="logo">EcoBook</span>

    <div className="nav-tabs">
      <Button
        variant={activeTab === 'donate' ? 'primary' : 'outline'}
        onClick={() => setActiveTab('donate')}
      >
        Donate/Receive
      </Button>
      <Button
        variant={activeTab === 'recycle' ? 'primary' : 'outline'}
        onClick={() => setActiveTab('recycle')}
      >
        Find Recyclables
      </Button>
    </div>
  </div>

  {/* RIGHT: navbar */}
  <div className="nav-right">
    <button className="icon-button" onClick={onNotificationsClick} aria-label="Notifications">
      <FaBell />
    </button>

    <button className="icon-button" onClick={onBonusClick} aria-label="Bonus">
      <FaDollarSign />
    </button>

    <div className="avatar-container">
      <button className="icon-button avatar-button" onClick={toggleAvatarDropdown} aria-label="User menu">
        <FaUserCircle />
      </button>

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


  {/* Donor Section */}
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

  {/* Recyclables Section */}
  {activeTab === 'recycle' && (
    <>
      <h4 className="section-title">Find materials to recycle</h4>
      <div className="grid-container">
        <Card>
          <h5>Search Materials</h5>
          <Button onClick={() => handleModal('searchMaterials')}>Search Materials</Button>
        </Card>
        <Card>
          <h5>My Requested</h5>
          <Button onClick={() => handleModal('searchMaterials')}>View requests</Button>
        </Card>
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
                //listedBooks={listedBooks}
                listedItems={listedItems}
                requests={requests}
                //statusList={statusList}
                listedBooks={booksWithStatus}
                requestedBooks={requestedBooks}
                searchResults={searchResults}
                materialsSearchResults={materialsSearchResults}
                selectedMaterials={selectedMaterials}
                formState={
                  modalContent === 'listBook' ? bookForm :
                  modalContent === 'listItem' ? itemForm :
                  modalContent === 'searchBook' ? searchForm :
                  materialSearchForm
                }
                setFormState={
                  modalContent === 'listBook' ? setBookForm :
                  modalContent === 'listItem' ? setItemForm :
                  modalContent === 'searchBook' ? setSearchForm :
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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;