import React, { useState } from "react";
import "./Dashboard_proc.css";
import { Link } from "react-router-dom";
import Notifications_proc from "../Notifications_proc/Notifications_proc";

function Dashboard_proc() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setPanelOpen(!panelOpen);

  // Check notification count from localStorage
  React.useEffect(() => {
    const checkNotifs = () => {
      const localNotifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
      setNotifCount(localNotifs.length);
    };
    checkNotifs();
    window.addEventListener("storage", checkNotifs);
    return () => window.removeEventListener("storage", checkNotifs);
  }, [panelOpen]);

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Dashboard</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <ul className="nav">
          <li>Overview</li>
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
            <Link to="/Sample_order">Samples</Link>
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

      {/* Main content */}
      <main className="main">
        <div className="topbar">
          <h1>Welcome Back</h1>
          <div className="user">
            <div className="notification" onClick={toggleNotifications} style={{ position: 'relative', cursor: 'pointer' }}>
              🔔
              {notifCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', background: 'red', borderRadius: '50%', border: '1px solid #fff', display: 'inline-block' }}></span>
              )}
            </div>
            <span>Procurement Officer</span>
            
          </div>
        </div>

        {/* Cards */}
        <div className="cards">
          <div className="card">
            <h3>Suppliers</h3>
            <p>Quick glance at suppliers and approvals.</p>
            <button className="btn">View Overview</button>
          </div>
          <div className="card">
            <h3>Orders</h3>
            <p>Track order status and delivery schedules.</p>
            <button className="btn">Manage Orders</button>
          </div>
          <div className="card">
            <h3>Budget</h3>
            <p>Review and approve budget requests.</p>
            <button className="btn">Approve Budgets</button>
          </div>
        </div>

        {/* Charts + Stats */}
        {/* Pie chart and key metrics removed for minimal dashboard */}
      </main>

      {/* Notifications Panel (dynamic) */}
      <Notifications_proc
        panelOpen={panelOpen}
        togglePanel={toggleNotifications}
      />
    </div>
  );
}

export default Dashboard_proc;
