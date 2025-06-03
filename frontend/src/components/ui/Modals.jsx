import React from 'react';
import { Button } from './Ui';

const ModalRenderer = ({
  modalType,
  closeModal,
  locations,
  listedBooks,
  //listedItems,
  requests,
  statusList,
  requestedBooks,
  searchResults,
  materialsSearchResults,
  selectedMaterials,
  formState,
  setFormState,
  onSubmit,
  onRequestBook,
  onDeliverRequest,
  onMarkReceived,
  onToggleMaterial,
  onRequestMaterials
}) => {
  switch (modalType) {
    case 'listBook':
      return (
        <form onSubmit={onSubmit}>
          <h5>List Book</h5>
          <label>Book Title:</label>
          <input
            type="text"
            required
            value={formState.title}
            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
          />
          <label>Condition:</label>
          <select
            value={formState.condition}
            onChange={(e) => setFormState({ ...formState, condition: e.target.value })}
          >
            <option>new</option>
            <option>fairly used</option>
            <option>old</option>
          </select>
          <label>Location:</label>
          <select
            value={formState.location}
            onChange={(e) => setFormState({ ...formState, location: e.target.value })}
          >
            {locations.map((loc) => (
              <option key={loc}>{loc}</option>
            ))}
          </select>
          <div className="mt-3">
            <Button type="submit">Submit</Button>
            <Button variant="outline" onClick={closeModal} style={{ marginLeft: 8 }}>
              Cancel
            </Button>
          </div>
        </form>
      );

    case 'viewListed':
      return (
        <>
          <h5>Listed Books</h5>
          {listedBooks.length === 0 ? (
            <p>No books listed yet.</p>
          ) : (
            <ul>
              {listedBooks.map((book) => (
                <li key={book.id}>
                  {book.title} - {book.condition} - {book.location}
                </li>
              ))}
            </ul>
          )}
          <Button onClick={closeModal}>Close</Button>
        </>
      );

    case 'listItem':
      return (
        <form onSubmit={onSubmit}>
          <h5>List Recyclable Item</h5>
          <label>Category:</label>
          <select
            value={formState.category}
            onChange={(e) => setFormState({ ...formState, category: e.target.value })}
          >
            <option>Magazine</option>
            <option>Newspaper</option>
            <option>Other printed</option>
          </select>
          <label>Number of Copies:</label>
          <input
            type="number"
            min="1"
            required
            value={formState.copies}
            onChange={(e) => setFormState({ ...formState, copies: e.target.value })}
          />
          <label>Location:</label>
          <select
            value={formState.location}
            onChange={(e) => setFormState({ ...formState, location: e.target.value })}
          >
            {locations.map((loc) => (
              <option key={loc}>{loc}</option>
            ))}
          </select>
          <div className="mt-3">
            <Button type="submit">Submit</Button>
            <Button variant="outline" onClick={closeModal} style={{ marginLeft: 8 }}>
              Cancel
            </Button>
          </div>
        </form>
      );

    case 'viewRequests':
      return (
        <>
          <h5>View Requests</h5>
          {requests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            <ul>
              {requests.map((req) => (
                <li key={req.id}>
                  <b>{req.title}</b> ({req.type}) - {req.requestedBy} - Status: {req.status}
                  {req.type === 'book' && req.status === 'Pending' && (
                    <Button size="sm" style={{ marginLeft: 8 }} onClick={() => onDeliverRequest(req.id)}>
                      Deliver
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Button onClick={closeModal}>Close</Button>
        </>
      );

    case 'viewStatus':
      return (
        <>
          <h5>Delivery Status</h5>
          {statusList.length === 0 ? (
            <p>No statuses available.</p>
          ) : (
            <ul>
              {statusList.map((s) => (
                <li key={s.id}>
                  {s.title} - {s.status}
                  {s.status === 'Pending Delivery' && (
                    <a href="#" onClick={(e) => e.preventDefault()} style={{ marginLeft: 8 }}>
                      View current location
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Button onClick={closeModal}>Close</Button>
        </>
      );

    case 'searchBook':
      return (
        <>
          <h5>Search Book</h5>
          <form onSubmit={onSubmit}>
            <label>Book Title:</label>
            <input
              type="text"
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
            />
            <label>Location:</label>
            <select
              value={formState.location}
              onChange={(e) => setFormState({ ...formState, location: e.target.value })}
            >
              {locations.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>
            <div className="mt-3">
              <Button type="submit">Search</Button>
              <Button variant="outline" onClick={closeModal} style={{ marginLeft: 8 }}>
                Cancel
              </Button>
            </div>
          </form>
          {searchResults.length > 0 && (
            <ul className="mt-3">
              {searchResults.map((book) => (
                <li key={book.id}>
                  {book.title} - {book.condition} - {book.location}
                  <Button size="sm" onClick={() => onRequestBook(book)} style={{ marginLeft: 8 }}>
                    Request
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      );

    case 'myRequestedBooks':
      return (
        <>
          <h5>My Requested Books</h5>
          {requestedBooks.length === 0 ? (
            <p>No requested books.</p>
          ) : (
            <ul>
              {requestedBooks.map((book) => (
                <li key={book.id}>
                  {book.title} - Status: {book.status}
                  {book.status === 'Delivery Initiated' && (
                    <Button
                      size="sm"
                      style={{ marginLeft: 8 }}
                      onClick={() => onMarkReceived(book.id)}
                    >
                      Mark as Received
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Button onClick={closeModal}>Close</Button>
        </>
      );

    case 'searchMaterials':
      return (
        <>
          <h5>Search Materials</h5>
          <form onSubmit={onSubmit}>
            <label>Location:</label>
            <select
              value={formState.location}
              onChange={(e) => setFormState({ ...formState, location: e.target.value })}
            >
              {locations.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>
            <div className="mt-3">
              <Button type="submit">Search</Button>
              <Button variant="outline" onClick={closeModal} style={{ marginLeft: 8 }}>
                Cancel
              </Button>
            </div>
          </form>
          {materialsSearchResults.length > 0 && (
            <>
              <ul className="mt-3">
                {materialsSearchResults.map((item) => (
                  <li key={item.id}>
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(item.id)}
                      onChange={() => onToggleMaterial(item.id)}
                    />
                    <span style={{ marginLeft: 8 }}>
                      {item.category} - {item.copies} copies - {item.location}
                    </span>
                  </li>
                ))}
              </ul>
              <Button onClick={onRequestMaterials}>Request Selected</Button>
            </>
          )}
        </>
      );

    default:
      return null;
  }
};

export default ModalRenderer;
