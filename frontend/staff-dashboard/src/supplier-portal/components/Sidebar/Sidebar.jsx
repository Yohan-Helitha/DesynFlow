import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { FaTimes, FaSignInAlt, FaExchangeAlt, FaUserTie, FaTruck } from 'react-icons/fa';

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Check if we're currently on the supplier dashboard
  const isSupplierDashboard = location.pathname === '/procurement-officer/dashboard_sup';
  const isProcurementDashboard = location.pathname === '/procurement-officer' || location.pathname === '/procurement-officer/';

  // Close sidebar on Escape key for accessibility
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  return (
    <>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Dashboard</h2>
          <button
            type="button"
            className="close-btn"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <FaTimes />
          </button>
        </div>

        {/* Dashboard Toggle Section */}
        <div className="dashboard-toggle">
          <h3>View Mode</h3>
          <div className="toggle-buttons">
            <Link 
              to="/procurement-officer" 
              className={`toggle-btn ${isProcurementDashboard ? 'active' : ''}`}
              title="Procurement Officer Dashboard"
            >
              <FaUserTie />
              <span>Procurement View</span>
            </Link>
            <Link 
              to="/procurement-officer/dashboard_sup" 
              className={`toggle-btn ${isSupplierDashboard ? 'active' : ''}`}
              title="Supplier Dashboard View"
            >
              <FaTruck />
              <span>Supplier View</span>
            </Link>
          </div>
        </div>
        <ul className="nav">
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
          <li>
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
    </>
  );
}

export default Sidebar;