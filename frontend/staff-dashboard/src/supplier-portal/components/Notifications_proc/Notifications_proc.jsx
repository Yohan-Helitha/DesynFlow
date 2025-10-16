import React, { useEffect, useState } from "react";
import "./Notifications_proc.css";
import { Link } from "react-router-dom";
import { FaBell, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTrash, FaTimes } from 'react-icons/fa';

function Notifications_proc({ panelOpen, togglePanel }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (panelOpen) {
      // Get supplier-specific notifications for sample requests
      fetch("http://localhost:4000/api/supplier-notifications")
        .then((res) => res.json())
        .then((supplierNotifs) => {
          // Get local notifications
          const localNotifs = JSON.parse(
            localStorage.getItem("dashboard_notifications") || "[]"
          );
          
          // Combine and sort by timestamp
          const allNotifications = [...localNotifs, ...supplierNotifs]
            .sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));
          
          setNotifications(allNotifications);
        })
        .catch((error) => {
          console.error("Error fetching notifications:", error);
          // Fallback to local notifications
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
          <FaTimes />
        </button>
      </div>

      {/* Body */}
      <div className="panel-body">
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          notifications.map((n, idx) => {
            // Determine notification type and status for display
            let statusClass = "";
            let notificationContent = "";
            let timestamp = "";

            // Handle different notification formats
            if (n.message) {
              // Direct message notifications (from localStorage)
              notificationContent = n.message;
              if (n.type === "success") statusClass = "approved";
              else if (n.type === "error") statusClass = "rejected";
              else if (n.type === "info") statusClass = "info";
              timestamp = n.timestamp || new Date().toISOString();
            } else if (n.type === "order" && n.status) {
              // Order status notifications
              notificationContent = `Order #${n.orderId || 'Unknown'} was ${n.status}.`;
              if (n.status.toLowerCase().includes("approved")) statusClass = "approved";
              else if (n.status.toLowerCase().includes("rejected")) statusClass = "rejected";
              timestamp = n.time || n.createdAt || new Date().toISOString();
            } else if (n.supplierId) {
              // Supplier-related notifications
              const companyName = n.supplierId.companyName || n.supplierId || "Unknown Supplier";
              notificationContent = `Order approved by supplier ${companyName}.`;
              statusClass = "approved";
              timestamp = n.createdAt || new Date().toISOString();
            } else if (n.status) {
              // Generic status notifications
              notificationContent = `Status update: ${n.status}`;
              statusClass = "info";
              timestamp = n.createdAt || n.time || new Date().toISOString();
            } else {
              // Fallback for unknown notification types
              notificationContent = n.text || n.description || "New notification received";
              statusClass = "info";
              timestamp = n.createdAt || n.timestamp || new Date().toISOString();
            }
            
            return (
              <div key={n._id || n.orderId || n.id || idx} className={`note ${statusClass}`}>
                <div className="notification-content">
                  <div className="notification-icon">
                    {statusClass === "approved" && <FaCheckCircle className="icon-approved" />}
                    {statusClass === "rejected" && <FaTimesCircle className="icon-rejected" />}
                    {statusClass === "info" && <FaInfoCircle className="icon-info" />}
                    {!statusClass && <FaBell className="icon-default" />}
                  </div>
                  <div className="notification-text">
                    {notificationContent}
                  </div>
                </div>
                <small>
                  {new Date(timestamp).toLocaleString()}
                </small>
              </div>
            );
          })
        )}
      </div>

      {/* Footer with Clear button */}
      <div className="panel-footer">
        <button className="clear-btn" onClick={handleClear}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

export default Notifications_proc;
