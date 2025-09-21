import React, { useState } from "react";
import "./Dashboard_proc.css";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Link } from "react-router-dom";
import Notifications_proc from "../Notifications_proc/Notifications_proc";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

function Dashboard_proc() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setPanelOpen(!panelOpen);

  // Pie chart data
  const pieData = {
    labels: ["Steel", "Cement", "Wood", "Paint", "Glass"],
    datasets: [
      {
        data: [35, 25, 15, 15, 10],
        backgroundColor: [
          "#8B5E34",
          "#A47148",
          "#D4A373",
          "#EAD7C3",
          "#FFF5E1",
        ],
        borderColor: "#F7EED3",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#2c2c2c", font: { size: 12 } },
      },
    },
    maintainAspectRatio: false,
  };

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
            <div className="notification" onClick={toggleNotifications}>
              🔔
            </div>
            <span>Admin</span>
            <img src="" alt="user" />
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
        <div className="charts">
          <div className="chart-box small">
            <h3>Material Usage</h3>
            <div className="chart-container small-chart">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>

          <div className="stats-box">
            <h3>Key Metrics</h3>
            <div className="stats-grid">
              <div className="stat">
                <h2>52</h2>
                <p>Total Suppliers</p>
              </div>
              <div className="stat">
                <h2>14</h2>
                <p>Pending Orders</p>
              </div>
              <div className="stat">
                <h2>$1.2M</h2>
                <p>Approved Budgets</p>
              </div>
              <div className="stat">
                <h2>7</h2>
                <p>New Alerts</p>
              </div>
            </div>
          </div>
        </div>
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
