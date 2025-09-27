import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Dashboard</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <ul className="nav">
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/Supplier_details">Suppliers</Link>
          </li>
          <li>
            <Link to="/Orders">Orders</Link>
          </li>
          <li>
            <Link to="/Budget_approval">Budget Approval</Link>
          </li>
          <li>
            <Link to="/Dashboard_sup">Supplier Dashboard</Link>
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