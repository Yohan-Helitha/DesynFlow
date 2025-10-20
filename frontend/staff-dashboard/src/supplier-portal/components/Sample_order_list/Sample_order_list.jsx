import React, { useEffect, useState } from "react";
import "./Sample_order_list.css";
import { Link, useNavigate } from "react-router-dom";
import { FaBox, FaTimes } from 'react-icons/fa';

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

  const fetchSamples = () => {
    setLoading(true);
    fetch("/api/samples/all")
      .then(res => res.json())
      .then(data => {
        setSamples(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
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

        {/* Procurement Officer Navigation */}
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
            <Link to="/procurement-officer/sample_order" className="request-new-btn">
              + Request New Sample
            </Link>
          </div>
        </div>
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
                  <td>{s.supplierId?.companyName || s.supplierId?.name || "Unknown"}</td>
                  <td>{s.materialId?.materialName || s.materialId?.name || "Unknown"}</td>
                  <td>{s.requestedBy?.name || s.requestedBy?.email || "Unknown"}</td>
                  <td><span className={`status-badge ${s.status.toLowerCase()}`}>{s.status}</span></td>
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

