import React, { useEffect, useState } from "react";
import "./Notifications_proc.css";
import { Link } from "react-router-dom";

function Notifications_proc({ panelOpen, togglePanel }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (panelOpen) {
      // Get backend notifications
      fetch("http://localhost:3000/notification")
        .then((res) => res.json())
        .then((data) => {
          // Get local notifications
          const localNotifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
          setNotifications([...localNotifs.reverse(), ...data]);
        })
        .catch(() => {
          const localNotifs = JSON.parse(localStorage.getItem("dashboard_notifications") || "[]");
          setNotifications(localNotifs.reverse());
        });
    }
  }, [panelOpen]);

  // Clear notifications handler
  const handleClear = () => {
    localStorage.removeItem("dashboard_notifications");
    setNotifications((prev) => prev.filter((n) => !n.type || n.type !== "order"));
  };

  return (
    <div className={`notification-panel ${panelOpen ? "active" : ""}`}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Notifications</h2>
        <div>
          <button style={{ marginRight: '8px', fontSize: '12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }} onClick={handleClear}>Clear</button>
          <button className="close-btn" onClick={togglePanel}>×</button>
        </div>
      </div>
      <div className="panel-body">
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          notifications.map((n, idx) => (
            <div key={n._id || n.orderId || idx} className="note">
              {n.type === "order" ? (
                <p>
                  Order <strong>{n.orderId}</strong> was <strong>{n.status}</strong>.
                </p>
              ) : n.supplierId ? (
                <p>
                  Supplier <strong>{n.supplierId.companyName}</strong> has an update.
                </p>
              ) : (
                <p>
                  Notification: <strong>{n.status}</strong>
                </p>
              )}
              <small>{n.time ? new Date(n.time).toLocaleString() : n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications_proc;
