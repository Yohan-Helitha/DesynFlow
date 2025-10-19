// import React, { createContext, useState, useEffect, useContext } from "react";
// import { fetchThresholdAlerts } from "../services/FthresholdAlertService.js";
// import { fetchTransferRequests } from "../services/FtransferRequestService.js";
// import { useLocation } from "react-router-dom";

// const notificationContext = createContext();

// export const useNotifications = () => useContext(notificationContext);

// export const NotificationsProvider = ({ children }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [unread, setUnread] = useState(false);
//   const location = useLocation();

//   // load read IDs from localStorage
//   const getReadIds = () => {
//     try {
//       return JSON.parse(localStorage.getItem("readNotifications")) || [];
//     } catch {
//       return [];
//     }
//   };

//   const saveReadIds = (ids) => {
//     localStorage.setItem("readNotifications", JSON.stringify(ids));
//   };

//   const getNotifications = async () => {
//     try {
//       const alerts = await fetchThresholdAlerts();
//       const requests = await fetchTransferRequests();

//       const alertNotifications = alerts.map((a) => ({
//         id: a._id,
//         type: "alert",
//         title: a.materialName,
//         message: `Current Level: ${a.currentLevel} | Inventory: ${a.inventoryName}`,
//         date: a.alertDate,
//         borderColor: "border-red-500",
//       }));

//       const requestNotifications = requests
//         .filter((r) => r.status === "Approved")
//         .map((r) => ({
//           id: r._id,
//           type: "transfer",
//           title: `Transfer Request ${r.transferRequestId}`,
//           message: `Approved from ${r.fromLocation} → ${r.toLocation}, Qty: ${r.quantity}`,
//           date: r.updatedAt || r.createdAt,
//           borderColor: "border-blue-500",
//         }));

//       const combined = [...alertNotifications, ...requestNotifications].sort(
//         (a, b) => new Date(b.date) - new Date(a.date)
//       );

//       setNotifications(combined);

//       // check if there are unread notifications
//       const readIds = getReadIds();
//       const hasUnread = combined.some((n) => !readIds.includes(n.id));

//       if (hasUnread && location.pathname !== "/notifications") {
//         setUnread(true);
//       }
//     } catch (err) {
//       console.error("Failed to fetch notifications:", err);
//     }
//   };

//   // Poll every 10s
//   useEffect(() => {
//     const fetchData = async () => {
//       await getNotifications();

//       // If user is on notifications page -> mark all as read
//       if (location.pathname === "/notifications") {
//         const allIds = notifications.map((n) => n.id);
//         saveReadIds(allIds);
//         setUnread(false);
//       }
//     };

//     fetchData();
//     // Auto-refresh removed - users can manually refresh if needed
//   }, [location.pathname]);

//   const markAsRead = () => {
//     const allIds = notifications.map((n) => n.id);
//     saveReadIds(allIds);
//     setUnread(false);
//   };

//   return (
//     <notificationContext.Provider value={{ notifications, unread, markAsRead }}>
//       {children}
//     </notificationContext.Provider>
//   );
// };

// In your notificationContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchThresholdAlerts } from "../services/FthresholdAlertService.js";
import { fetchTransferRequests } from "../services/FtransferRequestService.js";
import { fetchSReorderRequests } from "../services/FsReorderRequestService.js";
import { useLocation } from "react-router-dom";

const notificationContext = createContext();

export const useNotifications = () => useContext(notificationContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  // Load read IDs from localStorage
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

  const getProductType = (id) => {
    if (!id) return "Unknown";
    if (id.startsWith("MP")) return "Manufactured Product";
    if (id.startsWith("RM")) return "Raw Material";
    if (id.startsWith("TR")) return "Transfer Request";
    if (id.startsWith("SRR")) return "Stock Restocked Notification";
    return "Unknown";
  };

  const fetchAllNotifications = async () => {
    try {
      const alerts = await fetchThresholdAlerts();
      const requests = await fetchTransferRequests();
      const reorderRequests = await fetchSReorderRequests();

      const alertNotifications = alerts.map((a) => ({
        id: a._id,
        type: "alert",
        productType: getProductType(a.materialId),
        title: `Threshold Alert: ${a.materialName}`,
        message: `Current Level: ${a.currentLevel} | Inventory: ${a.inventoryName}`,
        date: a.alertDate,
        borderColor: "border-red-500",
      }));

      const requestNotifications = requests
        .filter((r) => r.status === "Approved")
        .map((r) => ({
          id: r._id,
          type: "transfer",
          productType: getProductType(r.transferRequestId),
          title: `Transfer Request ${r.transferRequestId}`,
          message: `Approved from ${r.fromLocation} → ${r.toLocation}, Qty: ${r.quantity}`,
          date: r.updatedAt || r.createdAt,
          borderColor: "border-blue-500",
        }));

      const reorderNotificationsList = reorderRequests
        .filter((r) => r.status?.toLowerCase() === "checked")
        .map((r) => ({
          id: r._id,
          type: "reorder",
          productType: "Restocked",
          title: `Stock Restocked: ${r.materialName}`,
          message: `Checked reorder request ${r.stockReorderRequestId} has been updated`,
          inventoryName: r.inventoryName,
          date: r.updatedAt || r.createdAt,
          borderColor: "border-yellow-500",
        }));

      const allNotifications = [
        ...alertNotifications,
        ...requestNotifications,
        ...reorderNotificationsList
      ];

      setNotifications(allNotifications);

      // Check if there are unread notifications
      const readIds = getReadIds();
      const unreadNotifications = allNotifications.filter(n => !readIds.includes(n.id));
      const hasUnread = unreadNotifications.length > 0;

      setUnread(hasUnread);
      setUnreadCount(unreadNotifications.length);

    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchAllNotifications();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchAllNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Mark all as read when on notifications page
  useEffect(() => {
    if (location.pathname === "/warehouse-manager/notifications") {
      markAsRead();
    }
  }, [location.pathname, notifications]);

  const markAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    saveReadIds(allIds);
    setUnread(false);
    setUnreadCount(0);
  };

  const markNotificationAsRead = (id) => {
    const readIds = getReadIds();
    const newReadIds = [...readIds, id];
    saveReadIds(newReadIds);
    
    const remainingUnread = notifications.filter(n => !newReadIds.includes(n.id));
    setUnread(remainingUnread.length > 0);
    setUnreadCount(remainingUnread.length);
  };

  const updateUnreadStatus = () => {
    const readIds = getReadIds();
    const unreadNotifications = notifications.filter(n => !readIds.includes(n.id));
    setUnread(unreadNotifications.length > 0);
    setUnreadCount(unreadNotifications.length);
  };

  return (
    <notificationContext.Provider value={{ 
      notifications, 
      unread, 
      unreadCount,
      markAsRead, 
      markNotificationAsRead,
      updateUnreadStatus,
      refreshNotifications: fetchAllNotifications 
    }}>
      {children}
    </notificationContext.Provider>
  );
};