import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Card, Button } from '../components/ui/Ui';
import { FaBell, FaUserCircle, FaDollarSign } from 'react-icons/fa';

import ModalRenderer from '../components/ui/Modals';
import '../app.css';

const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret'];

const Layout = () => {
  const { token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('donate');
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);

  const toggleAvatarDropdown = () => setShowAvatarDropdown(!showAvatarDropdown);
  const onNotificationsClick = () => alert('Open notifications panel');
  const onBonusClick = () => alert('Show bonus info');

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  //  Updated request section
 const [requests, setRequests] = useState([]); // For donor-owned material requests
const [requestedBooks, setRequestedBooks] = useState([]); // For recipient's requested books
const [searchResults, setSearchResults] = useState([]);
const [materialsSearchResults, setMaterialsSearchResults] = useState([]);
const [selectedMaterials, setSelectedMaterials] = useState([]);
const [requestedMaterials, setRequestedMaterials ] = useState([]);


  const [bookForm, setBookForm] = useState({ type: 'book', title: '', condition: 'new', location: locations[0] });
  const [itemForm, setItemForm] = useState({ category: 'Magazine', copies: '', location: locations[0] });
  const [searchForm, setSearchForm] = useState({ title: '', location: locations[0] });
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
//fetch from materials table** //Good✔
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
//fetch requests after recipient or papermill requests for book or material respectively **//Notgood❌
  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/inventory/incomingRequest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchListedMaterials();
    fetchRequests();
  }, [fetchListedMaterials, fetchRequests]);

//for the above chunk, the database is updated, but recipient can't view requested materials
//Fix✔✔✔
const fetchRequestedBooks = async () => {
  try {
    const response = await axios.get('http://localhost:5000/inventory/BookRequest', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const books = response.data.requests.map(req => ({
      id: req.id,
      title: req.material?.title || 'Untitled',
      status: req.status,
    }));
    setRequestedBooks(books);
  } catch (err) {
    console.error('Error fetching requested books:', err);
    alert('Failed to fetch your requested books');
  }
};
useEffect(() => {
  if (modalContent === 'myRequestedBooks') {
    fetchRequestedBooks();
  }
});

//fetch RECYCALBLE MATERIALS I REQUESTED** ✔🆗
const fetchRequestedRecyclables = async () => {
  try {
    const response = await axios.get('http://localhost:5000/inventory/OutgoingRequest', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const materials = response.data.requests.map(req => ({
      id: req.id,
      category: req.material.category,
      copies: req.material.copies,
      location: req.material.location,
      status: req.status,
    }));
    setRequestedMaterials(materials);
  } catch (err) {
    console.error('Error fetching requested recyclables:', err);
    alert('Failed to fetch requested recyclables');
  }
};

useEffect(() => {
  if (modalContent === 'viewMillRequests') {
    fetchRequestedRecyclables();
  }
});

//List a new book, update the database** //Good✔
  const submitListBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/inventory/materials', { ...bookForm, type: 'book' }, {
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
//List a new item to recycle and update database** //Good✔✔
  const submitListItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/inventory/materials', { ...itemForm, type: 'recyclable' }, {
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
//check status of books** //Good✔✔ but only showing 'not requested yet'
  const booksWithStatus = listedBooks.map(book => {
    const matchingRequest = requests.find(r => r.material?.id === book.id);
    return { ...book, status: matchingRequest?.status || 'Not requested yet' };
  });
//Search for available book when you want to receive from a donor** //Good✔✔ 
  const submitSearchBook = (e) => {
    e.preventDefault();
    const filtered = listedBooks.filter(b =>
      b.location === searchForm.location &&
      b.title.toLowerCase().includes(searchForm.title.toLowerCase())
    );
    setSearchResults(filtered);
  };
//Submit book request**//Good✔✔ Book request has been sbmitted successfully and database updated
  const submitRequestBook = async (book) => {
  try {
    await axios.post('http://localhost:5000/inventory/newRequest', {
      materialId: book.id,
      type: 'book'
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchRequests();
    alert(`Requested "${book.title}"`);
  } catch (err) {
    console.error('Error requesting book:', err);
    alert('Failed to request book');
  }
};


//For this **Not Good❌❌ the donor's 'view requests' function is missing so he cannot submit deliver
const submitDeliverRequest = async (reqId) => {
  try {
    await axios.patch('http://localhost:5000/inventory/requestStatus', {
      requestId: reqId,
      status: 'in_transit'
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchRequests();
    alert('Recipient notified, Delivery is initiated');
  } catch (err) {
    console.error('Error updating delivery status:', err);
  }
};

//**Missing the 'view my requests function **//

//For the below chunk //** Not Good ❌❌, the recipient's 'View requests function missing so he cannot mark as received.
const submitMarkReceived = async (reqId) => {
  try {
    await axios.patch('http://localhost:5000/inventory/requestStatus', {
      requestId: reqId,
      status: 'delivered'
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchRequests();
    alert('Marked as received.');
  } catch (err) {
    console.error('Error marking as received:', err);
  }
};

//search for items to recycle** //Good✔✔
  const submitSearchMaterials = (e) => {
    e.preventDefault();
    const filtered = listedItems.filter(i => i.location === materialSearchForm.location);
    setMaterialsSearchResults(filtered);
  };

  const toggleSelectMaterial = (id) => {
    setSelectedMaterials(
      selectedMaterials.includes(id)
        ? selectedMaterials.filter(mid => mid !== id)
        : [...selectedMaterials, id]
    );
  };

//Submit book request**//Good✔✔ Book request has been sbmitted successfully and database updated

  const submitRequestMaterials = async () => {
    if (selectedMaterials.length === 0) {
      alert('Please select materials');
      return;
    }
    try {
      await Promise.all(
        selectedMaterials.map(id =>
          axios.post('http://localhost:5000/inventory/newRequest', {
            materialId: id,
            type: 'recyclable'
          }, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      await fetchRequests();
      alert(`Requested materials with IDs: ${selectedMaterials.join(', ')}`);
      closeModal();
    } catch (err) {
      console.error('Error requesting materials:', err);
      alert('Failed to request materials');
    }
  };
//for the above chunk, the database is updated, but papermill can't view their requested materials'items to recycle'

//For this **Not Good❌❌ the donor's 'view requests' function is missing so he cannot submit deliver
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
            <Card><h5>Search Materials</h5><Button onClick={() => handleModal('searchMaterials')}>Search Materials</Button></Card>
            <Card><h5>Items to recycle</h5><Button onClick={() => handleModal('viewMillRequests')}>View requests</Button></Card>
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

export default Layout;
