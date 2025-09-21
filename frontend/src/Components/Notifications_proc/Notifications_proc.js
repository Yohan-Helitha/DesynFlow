import React, { useEffect, useState } from "react";
import "./Notifications_proc.css";
import { Link } from "react-router-dom";

function Notifications_proc({ panelOpen, togglePanel }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (panelOpen) {
      fetch("http://localhost:3000/notification")
        .then((res) => res.json())
        .then((data) => setNotifications(data))
        .catch(() => setNotifications([]));
    }
  }, [panelOpen]);

  return (
    <div className={`notification-panel ${panelOpen ? "active" : ""}`}>
      <div className="panel-header">
        <h2>Notifications</h2>
        <button className="close-btn" onClick={togglePanel}>×</button>
      </div>
      <div className="panel-body">
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="note">
              <p>
                {n.supplierId ? (
                  <>Supplier <strong>{n.supplierId.companyName}</strong> has an update.</>
                ) : (
                  <>Notification: <strong>{n.status}</strong></>
                )}
              </p>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications_proc;
