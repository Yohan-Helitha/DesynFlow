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
          const localNotifs = JSON.parse(
            localStorage.getItem("dashboard_notifications") || "[]"
          );
          setNotifications([...localNotifs.reverse(), ...data]);
        })
        .catch(() => {
          const localNotifs = JSON.parse(
            localStorage.getItem("dashboard_notifications") || "[]"
          );
          setNotifications(localNotifs.reverse());
        });
    }
  }, [panelOpen]);

  // Clear notifications handler
  const handleClear = () => {
    localStorage.removeItem("dashboard_notifications");
    setNotifications((prev) =>
      prev.filter((n) => !n.type || n.type !== "order")
    );
  };

  return (
    <div className={`notification-panel ${panelOpen ? "active" : ""}`}>
      {/* Header */}
      <div className="panel-header">
        <h2>Notifications</h2>
        <button className="close-btn" onClick={togglePanel}>
          ×
        </button>
      </div>

      {/* Body */}
      <div className="panel-body">
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          notifications.map((n, idx) => {
            // Determine status for color coding
            let statusClass = "";
            if (n.type === "order" && n.status) {
              if (n.status.toLowerCase().includes("approved")) {
                statusClass = "approved";
              } else if (n.status.toLowerCase().includes("rejected")) {
                statusClass = "rejected";
              }
            } else if (n.supplierId) {
              statusClass = "approved"; // Supplier notifications are approvals
            }
            
            return (
              <div key={n._id || n.orderId || idx} className={`note ${statusClass}`}>
                {n.type === "order" ? (
                  <p>
                    Order <strong>{n.orderId}</strong> was{" "}
                    <strong>{n.status}</strong>.
                  </p>
                ) : n.supplierId ? (
                  <p>
                    Order approved by the supplier{" "}
                    <strong>{n.supplierId.companyName}</strong>.
                  </p>
                ) : (
                  <p>
                    Notification: <strong>{n.status}</strong>
                  </p>
                )}
                <small>
                  {n.time
                    ? new Date(n.time).toLocaleString()
                    : n.createdAt
                    ? new Date(n.createdAt).toLocaleString()
                    : ""}
                </small>
              </div>
            );
          })
        )}
      </div>

      {/* Footer with Clear button */}
      <div className="panel-footer">
        <button className="clear-btn" onClick={handleClear}>
          🗑
        </button>
      </div>
    </div>
  );
}

export default Notifications_proc;
