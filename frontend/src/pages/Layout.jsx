
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, Button, Avatar } from '../components/ui/Ui';
import { FaBell, FaUserCircle, FaDollarSign } from 'react-icons/fa';

import ModalRenderer from '../components/ui/Modals';
import '../app.css';

const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret'];

const Layout = () => {
  const [activeTab, setActiveTab] = useState('donate');
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const { logout } = useAuth();

   const toggleAvatarDropdown = () => setShowAvatarDropdown(!showAvatarDropdown);
  const onNotificationsClick = () => alert('Open notifications panel');
  const onBonusClick = () => alert('Show bonus info')

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [listedBooks, setListedBooks] = useState([]);
  const [listedItems, setListedItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [statusList,] = useState([]);
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [materialsSearchResults, setMaterialsSearchResults] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const [bookForm, setBookForm] = useState({ title: '', condition: 'new', location: locations[0] });
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

  const submitListBook = (e) => {
    e.preventDefault();
    setListedBooks([...listedBooks, { ...bookForm, id: Date.now() }]);
    alert('List updated');
    closeModal();
  };

  const submitListItem = (e) => {
    e.preventDefault();
    setListedItems([...listedItems, { ...itemForm, id: Date.now() }]);
    alert('Updated successfully');
    closeModal();
  };

  const submitSearchBook = (e) => {
    e.preventDefault();
    const filtered = listedBooks.filter(
      (b) =>
        b.location === searchForm.location &&
        b.title.toLowerCase().includes(searchForm.title.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const submitSearchMaterials = (e) => {
    e.preventDefault();
    const filtered = listedItems.filter(i => i.location === materialSearchForm.location);
    setMaterialsSearchResults(filtered);
  };

  const submitRequestBook = (book) => {
    setRequests([...requests, {
      id: Date.now(),
      type: 'book',
      title: book.title,
      requestedBy: `You - ${book.location}`,
      status: 'Pending',
    }]);
    alert(`Requested "${book.title}"`);
  };

  const submitDeliverRequest = (reqId) => {
    setRequests(requests.map((r) =>
      r.id === reqId ? { ...r, status: 'Initiated delivery' } : r
    ));
    alert('Recipient notified. Delivery initiated.');
  };

  const submitMarkReceived = (bookId) => {
    setRequestedBooks(requestedBooks.map((b) =>
      b.id === bookId ? { ...b, status: 'Delivered' } : b
    ));
    alert('Marked as received.');
  };

  const toggleSelectMaterial = (id) => {
    setSelectedMaterials(
      selectedMaterials.includes(id)
        ? selectedMaterials.filter((mid) => mid !== id)
        : [...selectedMaterials, id]
    );
  };

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
                listedBooks={listedBooks}
                listedItems={listedItems}
                requests={requests}
                statusList={statusList}
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
