import React, { useEffect, useState } from "react";
import "./Dashboard_sup.css";
import { Link } from "react-router-dom";

function Dashboard_sup() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [hiddenRequests, setHiddenRequests] = useState([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    // Fetch sample requests from backend
    fetch("http://localhost:3000/api/samples/123") // replace 123 with supplierId (auth/session later)
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch((err) => console.error("Error fetching sample requests:", err));
  }, []);

  const handleNoted = (id) => {
    // Hide from supplier’s view (not delete from DB)
    setHiddenRequests([...hiddenRequests, id]);
  };

  const visibleRequests = requests.filter(
    (req) => !hiddenRequests.includes(req._id)
  );

  return (
    <div className="supplier-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Supplier Panel</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <ul className="nav">
          <li>Overview</li>
          <li><Link to="/Order_details_sup">Orders</Link></li>
          <li>Samples</li>
          <li>Profile</li>
        </ul>
      </aside>

      {/* Hamburger */}
      {!sidebarOpen && (
        <button className="hamburger" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {/* Main */}
      <main className="main-content">
        <div className="topbar">
          <h1>Welcome Supplier</h1>
          <div className="profile">
            <span>Supplier Name</span>
            <img src="/avatar.png" alt="profile" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="cards">
          <div className="card">
            <h3>New Requests</h3>
            <p>{visibleRequests.length}</p>
          </div>
          <div className="card">
            <h3>Pending Reviews</h3>
            <p>5</p>
          </div>
          <div className="card">
            <h3>Completed Orders</h3>
            <p>12</p>
          </div>
        </div>

        {/* Sample Requests */}
        <section className="sample-requests">
          <h2>Sample Order Requests</h2>
          {visibleRequests.length === 0 ? (
            <p className="empty">No new sample requests 🎉</p>
          ) : (
            visibleRequests.map((req) => (
              <div key={req._id} className="request-card">
                <div className="request-info">
                  <p>
                    <strong>Material ID:</strong> {req.materialId}
                  </p>
                  <p>
                    <strong>Requested By:</strong> {req.requestedBy}
                  </p>
                  <p>
                    <strong>Status:</strong> {req.status}
                  </p>
                  {req.reviewNote && (
                    <p>
                      <strong>Note:</strong> {req.reviewNote}
                    </p>
                  )}
                </div>
                <button
                  className="btn-noted"
                  onClick={() => handleNoted(req._id)}
                >
                  Noted
                </button>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard_sup;
