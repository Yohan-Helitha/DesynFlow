import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchThresholdAlerts } from "../services/FthresholdAlertService.js";
import { fetchTransferRequests } from "../services/FtransferRequestService.js";
import { useLocation } from "react-router-dom";

const notificationContext = createContext();

export const useNotifications = () => useContext(notificationContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false);
  const location = useLocation();

  // load read IDs from localStorage
  const getReadIds = () => {
    try {
      return JSON.parse(localStorage.getItem("readNotifications")) || [];
    } catch {
      return [];
    }
  };

  const saveReadIds = (ids) => {
    localStorage.setItem("readNotifications", JSON.stringify(ids));
  };

  const getNotifications = async () => {
    try {
      const alerts = await fetchThresholdAlerts();
      const requests = await fetchTransferRequests();

      const alertNotifications = alerts.map((a) => ({
        id: a._id,
        type: "alert",
        title: a.materialName,
        message: `Current Level: ${a.currentLevel} | Inventory: ${a.inventoryName}`,
        date: a.alertDate,
        borderColor: "border-red-500",
      }));

      const requestNotifications = requests
        .filter((r) => r.status === "Approved")
        .map((r) => ({
          id: r._id,
          type: "transfer",
          title: `Transfer Request ${r.transferRequestId}`,
          message: `Approved from ${r.fromLocation} → ${r.toLocation}, Qty: ${r.quantity}`,
          date: r.updatedAt || r.createdAt,
          borderColor: "border-blue-500",
        }));

      const combined = [...alertNotifications, ...requestNotifications].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setNotifications(combined);

      // check if there are unread notifications
      const readIds = getReadIds();
      const hasUnread = combined.some((n) => !readIds.includes(n.id));

      if (hasUnread && location.pathname !== "/notifications") {
        setUnread(true);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Poll every 10s
  useEffect(() => {
    const fetchData = async () => {
      await getNotifications();

      // If user is on notifications page -> mark all as read
      if (location.pathname === "/notifications") {
        const allIds = notifications.map((n) => n.id);
        saveReadIds(allIds);
        setUnread(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const markAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    saveReadIds(allIds);
    setUnread(false);
  };

  return (
    <notificationContext.Provider value={{ notifications, unread, markAsRead }}>
      {children}
    </notificationContext.Provider>
  );
};
