import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./Sample_order_list.css";
import { Link, useNavigate } from "react-router-dom";
import { FaBox, FaTimes, FaTruck, FaEye } from 'react-icons/fa';

function Sample_order_list() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  
  const navigate = useNavigate();
  
  // Check if user is coming from procurement officer dashboard or supplier dashboard
  // Based on the current URL path or referrer
  const isProcurementView = window.location.pathname.includes('procurement-officer') && 
                            !window.location.pathname.includes('dashboard_sup');
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

  const fetchSamples = () => {
    setLoading(true);
    
    // Check if user is a supplier
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isSupplier = user.role === 'supplier' || user.userType === 'supplier';
    
    // Use different endpoints based on user role
    const endpoint = isSupplier ? "/api/samples/mine" : "/api/samples/all";
    const headers = isSupplier ? {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    } : {};
    
    fetch(endpoint, { headers })
      .then(res => res.json())
      .then(data => {
        setSamples(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching samples:', error);
        setSamples([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSamples();
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

        {isProcurementView ? (
          // Procurement Officer Navigation
          <ul className="sidebar-nav">
            <li>
              <Link to="/procurement-officer">Dashboard</Link>
            </li>
            <li>
              <Link to="/procurement-officer/supplier_details">Suppliers</Link>
            </li>
            <li>
              <Link to="/procurement-officer/orders">Orders</Link>
            </li>
            <li>
              <Link to="/procurement-officer/restock_alerts">Restock Alerts</Link>
            </li>
            <li>
              <Link to="/procurement-officer/budget_approval">Budget Approval</Link>
            </li>
            <li className="active">
              <Link to="/procurement-officer/sample_order_list">Sample Requests</Link>
            </li>
          </ul>
        ) : (
          // Supplier Navigation
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
              <span className="profile-settings-disabled">Profile Settings</span>
            </li>
          </ul>
        )}
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
        <div className="page-header">
          <h2><FaBox className="header-icon" /> Sample Order Requests</h2>
          <div className="header-actions">
            <button onClick={fetchSamples} className="refresh-btn" title="Refresh list">
              🔄 Refresh
            </button>
            {isProcurementView && (
              <Link to="/procurement-officer/sample_order" className="request-new-btn">
                + Request New Sample
              </Link>
            )}
          </div>
        </div>
      {loading ? (
        <p>Loading...</p>
      ) : samples.length === 0 ? (
        <p>No sample requests found.</p>
      ) : (
        <div className="table-container">
          <table className="sample-order-list-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier</th>
                <th>Material</th>
                <th>Status</th>
                <th>Note</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {samples.map((s, idx) => (
                  <tr key={s._id || idx}>
                    <td>REQ-00{idx + 1}</td>
                    <td>{s.supplierId?.companyName || s.supplierId?.name || "Unknown"}</td>
                    <td>{s.materialId?.materialName || s.materialId?.name || "Unknown"}</td>
                    <td><span className={`status-badge ${s.status.toLowerCase()}`}>{s.status}</span></td>
                    <td>{s.reviewNote || "-"}</td>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="info-btn"
                        onClick={() => setSelectedSample(s)}
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Modal rendered as portal at document body level */}
      {selectedSample && createPortal(
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Sample Request Details</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedSample(null)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="info-grid">
              <p>
                <b>Request ID:</b> REQ-00{samples.findIndex(s => s._id === selectedSample._id) + 1}
              </p>
              <p>
                <b>Supplier:</b> {selectedSample.supplierId?.companyName || selectedSample.supplierId?.name || "Unknown"}
              </p>
              <p>
                <b>Material:</b> {selectedSample.materialId?.materialName || selectedSample.materialId?.name || "Unknown"}
              </p>
              <p>
                <b>Requested By:</b> {selectedSample.requestedBy?.name || selectedSample.requestedBy?.email || "Unknown"}
              </p>
              <p>
                <b>Status:</b> <span className={`status-badge ${selectedSample.status.toLowerCase()}`}>{selectedSample.status}</span>
              </p>
              <p>
                <b>Note:</b> {selectedSample.reviewNote || "No additional notes"}
              </p>
              <p>
                <b>Request Date:</b> {new Date(selectedSample.createdAt).toLocaleString()}
              </p>
              {selectedSample.quantity && (
                <p>
                  <b>Quantity:</b> {selectedSample.quantity}
                </p>
              )}
              {selectedSample.urgency && (
                <p>
                  <b>Urgency:</b> {selectedSample.urgency}
                </p>
              )}
              {selectedSample.specifications && (
                <div>
                  <b>Specifications:</b>
                  <div className="specifications-container">
                    {selectedSample.specifications}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Sample_order_list;

