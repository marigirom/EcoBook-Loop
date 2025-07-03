import React from 'react';
import { Button } from './Ui';

const ModalRenderer = ({
  modalType,
  closeModal,
  locations,
  listedBooks,
  requests,
  requestedBooks,
  searchResults,
  materialsSearchResults,
  selectedMaterials,
  requestedMaterials,
  bonusSum,
  listings,
  summaryData,
  deleteListing,
  formState,
  setFormState,
  onSubmit,
  onRequestBook,
  onDeliverRequest,
  onItemPickedUp,
  onMarkReceived,
  onToggleMaterial,
  onRequestMaterials,
  onMarkMaterialReceived
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
            onChange={(e) => setFormState({ ...formState, copies: Number(e.target.value) })}
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
              <b>{req.title}</b> ({req.type}) - {req.requester?.name || 'unknown'} - Status: {req.status}
              
              {/*Deliver button for books*/}
              {req.type === 'book' && req.status === 'Pending' && (
                <Button size="sm" style={{ marginLeft: 8 }} onClick={() => onDeliverRequest(req.id)}>
                  Deliver
                </Button>
              )}

              {/*Picked Up button for recyclables*/}
              {req.type === 'recyclable' && req.status === 'Initiated-delivery' && (
                <Button size="sm" style={{ marginLeft: 8 }} onClick={() => onItemPickedUp(req.id)}>
                  Item Picked Up
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
          {listedBooks.length === 0 ? (
            <p>No books listed yet.</p>
          ) : (
            <ul>
              {listedBooks.map((book) => (
                <li key={book.id}>
                  <strong>{book.title}</strong> - {book.condition} - {book.location} <br />
                  <em>Status: {book.status || 'Not requested yet'}</em>
                  {book.status === 'Pending Delivery' && (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Tracking current location for "${book.title}"...`);
                      }}
                      style={{ marginLeft: 8 }}
                    >
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
                  {book.status === 'In-transit' && (
                    <Button size="sm" style={{ marginLeft: 8 }} onClick={() => onMarkReceived(book.id)}>
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

    case 'viewMillRequests':
      return (
        <>
          <h5>Requested Materials (Paper Mill)</h5>
          {(requestedMaterials?.length ?? 0) === 0 ? (
            <p>No requests made to donors yet.</p>
          ) : (
            <ul>
              {requestedMaterials.map((item) => (
                <li key={item.id}>
                  <b>{item.category}</b> ({item.copies} copies) - {item.location} <br />
                  <em>Status: {item.status}</em>
                  <div style={{ marginTop: 8 }}>
                    {item.status === 'Pending' && (
                      <Button size="sm" onClick={() => alert(`Pickup scheduled for ${item.category} at ${item.location}`)}>
                        Schedule Pickup
                      </Button>
                    )}
                    {item.status === 'In-transit' && (
                      <Button size="sm" onClick={() => onMarkMaterialReceived(item.id)}>
                        Mark as Received
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button onClick={closeModal} style={{ marginTop: 12 }}>
            Close
          </Button>
        </>
      );

   case 'viewBonuses':
  return (
    <>
      <h5>Bonuses Earned</h5>
      <p>Ksh {bonusSum}</p>
      <Button onClick={closeModal}>Close</Button>
    </>
  );

  case 'manageListings':
  return (
    <>
      <h5>My Listings</h5>
      {listings.length === 0 ? (
        <p>No items listed.</p>
      ) : (
        <ul>
          {listings.map((item) => (
            <li key={item.id}>
              {item.title || item.category} - {item.type} - Status: {item.status}
              {item.status === 'Delivered' && (
                <Button size="sm" style={{ marginLeft: 8 }} onClick={() => deleteListing(item.id)}>
                  Delete
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <Button onClick={closeModal}>Close</Button>
    </>
  );
  case 'viewSummary':
  return (
    <>
      <h5>Activity Summary</h5>
      {summaryData.length === 0 ? (
        <p>No activity to show.</p>
      ) : (
        <ul>
          {summaryData.map((entry, index) => (
            <li key={index}>
              {entry.type === 'book' && `Book "${entry.title}" delivered on ${entry.deliveredAt}`}
              {entry.type === 'recyclable' && `Recyclable "${entry.category}" received on ${entry.receivedAt}`}
            </li>
          ))}
        </ul>
      )}
      <Button onClick={closeModal}>Close</Button>
    </>
  );

   
    default:
      return null;
  }
};

export default ModalRenderer;
