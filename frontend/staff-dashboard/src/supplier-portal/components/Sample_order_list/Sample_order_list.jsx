import React, { useEffect, useState } from "react";
import "./Sample_order_list.css";
import { Link, useNavigate } from "react-router-dom";
import { FaBox, FaTimes, FaUserTie, FaTruck } from 'react-icons/fa';

function Sample_order_list() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // Toggle body class for sidebar state
    document.body.classList.toggle('sidebar-open', !sidebarOpen);
  };

  // Cleanup body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, []);

  useEffect(() => {
    // Fetch all sample orders (could filter by supplier/user if needed)
    fetch("http://localhost:4000/api/samples/all")
      .then(res => res.json())
      .then(data => {
        setSamples(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setSamples([]);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Supplier Panel</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        {/* Dashboard Toggle Section */}
        <div className="dashboard-toggle">
          <h3>View Mode</h3>
          <div className="toggle-buttons">
            <div 
              onClick={() => navigate('/procurement-officer')}
              className="toggle-btn"
              title="Procurement Officer Dashboard"
            >
              <FaUserTie />
              <span>Procurement Officer</span>
            </div>
            <div className="toggle-btn active" title="Supplier Dashboard">
              <FaTruck />
              <span>Supplier Portal</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li>
            <Link to="/procurement-officer/dashboard_sup">Dashboard</Link>
          </li>
          <li>
            <Link to="/procurement-officer/order_details_sup">My Orders</Link>
          </li>
          <li className="active">
            <Link to="/procurement-officer/sample_order_list">Sample Orders</Link>
          </li>
          <li>
            <span style={{color: '#AAB3A0', cursor: 'default'}}>Profile Settings</span>
          </li>
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

      {/* Main Content */}
      <div className="sample-order-list-page">
        <h2><FaBox className="header-icon" /> Sample Order Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : samples.length === 0 ? (
        <p>No sample requests found.</p>
      ) : (
        <table className="sample-order-list-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Material</th>
              <th>Requested By</th>
              <th>Status</th>
              <th>Note</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s, idx) => (
                <tr key={s._id || idx}>
                  <td>{s.supplierId?.companyName || s.supplierId || "Unknown"}</td>
                  <td>{s.materialId?.name || s.materialId || "Unknown"}</td>
                  <td>{s.requestedBy?.name || s.requestedBy || "Unknown"}</td>
                  <td>{s.status}</td>
                  <td>{s.reviewNote || "-"}</td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td>
                    <a href={`/Sample_order_details/${s._id}`} className="details-link">View Details</a>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      )}
      </div>
    </div>
  );
}

export default Sample_order_list;
