import React from 'react';
import './Dashboard_proc.css';

function Dashboard_proc() {
  // Simple toggle function without useState
  function toggleNotifications() {
    const panel = document.getElementById("panel");
    if (panel) {
      panel.classList.toggle("active");
    }
  }

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <ul className="nav">
          <li><a href="#" className="active">Dashboard Overview</a></li>
          <li><a href="#">Suppliers</a></li>
          <li><a href="#">Orders</a></li>
          <li><a href="#">Budget Approval</a></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main">
        <div className="topbar">
          <h1>Welcome Back</h1>
          <div className="user">
            {/* Notification Bell */}
            <div className="notification" onClick={toggleNotifications}>
              🔔
              <span className="badge">3</span>
            </div>
            <span>Admin</span>
            <img src="" alt="user" />
          </div>
        </div>

        <div className="cards">
          <div className="card">
            <h3>Suppliers</h3>
            <p>Quick glance at suppliers, orders, and budget approval progress.</p>
            <button className="btn">View Overview</button>
          </div>

          <div className="card">
            <h3>Orders</h3>
            <p>Track order status, delivery schedules, and approvals in real-time.</p>
            <button className="btn">Manage Orders</button>
          </div>

          <div className="card">
            <h3>Budget Approval</h3>
            <p>Review and approve budget requests with full audit trail visibility.</p>
            <button className="btn">Approve Budgets</button>
          </div>
        </div>
      </main>

      {/* Notification Panel */}
      <div className="notification-panel" id="panel">
        <div className="panel-close">
          <button onClick={toggleNotifications}>×</button>
        </div>
        <h2>Notifications</h2>

        <div className="note">
          <p>Supplier <strong>ABC Corp</strong> updated their contact info.</p>
          <small>2 mins ago</small>
        </div>

        <div className="note">
          <p>New order <strong>#4521</strong> has been shipped.</p>
          <small>10 mins ago</small>
        </div>

        <div className="note">
          <p>Budget request from <strong>Finance Dept</strong> pending approval.</p>
          <small>30 mins ago</small>
        </div>
      </div>
    </div>
  );
}

export default Dashboard_proc;
