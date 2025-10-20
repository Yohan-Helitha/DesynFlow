// import React, { useState, useEffect } from "react";
// import Navbar from "../component/navbar.jsx";
// import { fetchThresholdAlerts } from "../services/FthresholdAlertService.js";
// import { fetchTransferRequests } from "../services/FtransferRequestService.js";
// import { fetchSReorderRequests } from "../services/FsReorderRequestService.js";
// import { useNotifications } from "../context/notificationContext.jsx";
// import { Trash2 } from "lucide-react";

// const Notifications = () => {
//   const [thresholdAlerts, setThresholdAlerts] = useState([]);
//   const [transferRequests, setTransferRequests] = useState([]);
//   const [reorderNotifications, setReorderNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("alerts");
//   const [activeSubTab, setActiveSubTab] = useState("all");
//   const { markAsRead } = useNotifications();

//   const getProductType = (id) => {
//     if (!id) return "Unknown";
//     if (id.startsWith("MP")) return "Manufactured Product";
//     if (id.startsWith("RM")) return "Raw Material";
//     if (id.startsWith("TR")) return "Transfer Request";
//     if (id.startsWith("SRR")) return "Stock Restocked Notification";
//     return "Unknown";
//   };

//   const getNotifications = async () => {
//     try {
//       const alerts = await fetchThresholdAlerts();
//       const requests = await fetchTransferRequests();
//       const reorderRequests = await fetchSReorderRequests();

//       const alertNotifications = alerts.map((a) => ({
//         id: a._id,
//         type: "alert",
//         productType: getProductType(a.materialId),
//         title: `Threshold Alert: ${a.materialName}`,
//         message: `Current Level: ${a.currentLevel} | Inventory: ${a.inventoryName}`,
//         date: a.alertDate,
//         borderColor: "border-red-500",
//       }));

//       const requestNotifications = requests
//         .filter((r) => r.status === "Approved")
//         .map((r) => ({
//           id: r._id,
//           type: "transfer",
//           productType: getProductType(r.transferRequestId),
//           title: `Transfer Request ${r.transferRequestId}`,
//           message: `Approved from ${r.fromLocation} → ${r.toLocation}, Qty: ${r.quantity}`,
//           date: r.updatedAt || r.createdAt,
//           borderColor: "border-blue-500",
//         }));

//       const reorderNotificationsList = reorderRequests
//         .filter((r) => r.status?.toLowerCase() === "checked")
//         .map((r) => ({
//           id: r._id,
//           type: "reorder",
//           productType: "Restocked",
//           title: `Stock Restocked: ${r.materialName}`,
//           message: `Checked reorder request ${r.stockReorderRequestId} has been updated`,
//           inventoryName: r.inventoryName,
//           date: r.updatedAt || r.createdAt,
//           borderColor: "border-yellow-500",
//         }));

//       setThresholdAlerts(alertNotifications);
//       setTransferRequests(requestNotifications);
//       setReorderNotifications(reorderNotificationsList);

//     } catch (err) {
//       console.error("Failed to fetch notifications:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     markAsRead();
//     getNotifications();
//   }, []);

//   const deleteNotification = (id, type) => {
//     if (type === "alert") {
//       setThresholdAlerts((prev) => prev.filter((n) => n.id !== id));
//     } else if (type === "transfer") {
//       setTransferRequests((prev) => prev.filter((n) => n.id !== id));
//     } else if (type === "reorder") {
//       setReorderNotifications((prev) => prev.filter((n) => n.id !== id));
//     }
//   };

//   const renderList = (items) => {
//     if (loading) return <p>Loading...</p>;
//     if (items.length === 0) return <p>No notifications</p>;

//     return (
//       <ul className="space-y-4">
//         {items
//           .sort((a, b) => new Date(b.date) - new Date(a.date))
//           .map((n) => (
//             <li
//               key={n.id}
//               className={`flex flex-col md:flex-row md:justify-between items-start md:items-center border-l-4 ${n.borderColor} bg-[#F7EED3] rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200`}
//             >
//               <div className="flex flex-col">
//                 <span className="font-semibold text-gray-800 text-lg">
//                   {n.title}
//                   <span
//                     className={`ml-2 px-2 py-0.5 text-xs rounded ${
//                       n.productType === "Manufactured Product"
//                         ? "bg-amber-200 text-amber-800"
//                         : n.productType === "Raw Material"
//                         ? "bg-green-200 text-green-800"
//                         : n.productType === "Transfer Request"
//                         ? "bg-blue-200 text-blue-800"
//                         : "bg-yellow-200 text-yellow-800"
//                     }`}
//                   >
//                     {n.productType}
//                   </span>
//                 </span>
//                 <span className="text-gray-600 text-sm mt-1">
//                   {n.message}
//                   {n.inventoryName && (
//                     <span className="block text-gray-500 text-xs mt-1">
//                       Inventory: {n.inventoryName}
//                     </span>
//                   )}
//                 </span>
//               </div>
//               <div className="flex items-center mt-2 md:mt-0 space-x-4">
//                 <span className="text-gray-500 text-sm">
//                   {new Date(n.date).toLocaleString()}
//                 </span>
//                 <button
//                   onClick={() => deleteNotification(n.id, n.type)}
//                   className="p-1 rounded hover:bg-gray-100"
//                   title="Delete"
//                 >
//                   <Trash2 className="w-5 h-5 text-amber-500 hover:text-amber-600" />
//                 </button>
//               </div>
//             </li>
//           ))}
//       </ul>
//     );
//   };

//   const filteredAlerts = () => {
//     if (activeSubTab === "manufactured") {
//       return thresholdAlerts.filter((n) => n.productType === "Manufactured Product");
//     }
//     if (activeSubTab === "raw") {
//       return thresholdAlerts.filter((n) => n.productType === "Raw Material");
//     }
//     return thresholdAlerts;
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className="m-6 flex justify-center">
//         <div className="w-full max-w-3xl">
//           <h1 className="text-2xl font-bold mb-6">Notifications</h1>

//           {/* Main Tabs */}
//           <div className="flex border-b border-gray-300 mb-6">
//             <button
//               onClick={() => setActiveTab("alerts")}
//               className={`px-4 py-2 font-medium ${
//                 activeTab === "alerts"
//                   ? "border-b-2 border-blue-500 text-blue-600"
//                   : "text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               Threshold Alerts
//             </button>
//             <button
//               onClick={() => setActiveTab("transfers")}
//               className={`px-4 py-2 font-medium ml-4 ${
//                 activeTab === "transfers"
//                   ? "border-b-2 border-blue-500 text-blue-600"
//                   : "text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               Transfer Requests
//             </button>
//             <button
//               onClick={() => setActiveTab("reorders")}
//               className={`px-4 py-2 font-medium ml-4 ${
//                 activeTab === "reorders"
//                   ? "border-b-2 border-yellow-500 text-yellow-600"
//                   : "text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               Reorder Requests
//             </button>
//           </div>

//           <div className="border border-gray-300 p-6 rounded-lg bg-[#FFF8E8] shadow">
//             {activeTab === "alerts" && (
//               <>
//                 <div className="flex border-b border-gray-200 mb-4">
//                   <button
//                     onClick={() => setActiveSubTab("manufactured")}
//                     className={`px-3 py-1 text-sm font-medium ${
//                       activeSubTab === "manufactured"
//                         ? "border-b-2 border-amber-500 text-amber-600"
//                         : "text-gray-500 hover:text-gray-700"
//                     }`}
//                   >
//                     Manufactured Products
//                   </button>
//                   <button
//                     onClick={() => setActiveSubTab("raw")}
//                     className={`px-3 py-1 ml-3 text-sm font-medium ${
//                       activeSubTab === "raw"
//                         ? "border-b-2 border-green-500 text-green-600"
//                         : "text-gray-500 hover:text-gray-700"
//                     }`}
//                   >
//                     Raw Materials
//                   </button>
//                   <button
//                     onClick={() => setActiveSubTab("all")}
//                     className={`px-3 py-1 ml-3 text-sm font-medium ${
//                       activeSubTab === "all"
//                         ? "border-b-2 border-blue-400 text-blue-600"
//                         : "text-gray-500 hover:text-gray-700"
//                     }`}
//                   >
//                     All
//                   </button>
//                 </div>
//                 {renderList(filteredAlerts())}
//               </>
//             )}
//             {activeTab === "transfers" && renderList(transferRequests)}
//             {activeTab === "reorders" && renderList(reorderNotifications)}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Notifications;

import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { fetchThresholdAlerts } from "../services/FthresholdAlertService.js";
import { fetchTransferRequests } from "../services/FtransferRequestService.js";
import { fetchSReorderRequests } from "../services/FsReorderRequestService.js";
import { useNotifications } from "../context/notificationContext.jsx";
import { Trash2, Bell, BellOff, Filter, CheckCircle } from "lucide-react";

const Notifications = () => {
  const [thresholdAlerts, setThresholdAlerts] = useState([]);
  const [transferRequests, setTransferRequests] = useState([]);
  const [reorderNotifications, setReorderNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("alerts");
  const [activeSubTab, setActiveSubTab] = useState("all");
  const [readNotifications, setReadNotifications] = useState(new Set());
  const { markAsRead } = useNotifications();

  const getProductType = (id) => {
    if (!id) return "Unknown";
    if (id.startsWith("MP")) return "Manufactured Product";
    if (id.startsWith("RM")) return "Raw Material";
    if (id.startsWith("TR")) return "Transfer Request";
    if (id.startsWith("SRR")) return "Stock Restocked Notification";
    return "Unknown";
  };

  const getNotifications = async () => {
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
        bgColor: "bg-red-50",
        iconColor: "text-red-500",
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
          bgColor: "bg-blue-50",
          iconColor: "text-blue-500",
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
          bgColor: "bg-yellow-50",
          iconColor: "text-yellow-500",
        }));

      setThresholdAlerts(alertNotifications);
      setTransferRequests(requestNotifications);
      setReorderNotifications(reorderNotificationsList);

    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // Load read notifications from localStorage first
  const stored = localStorage.getItem("readNotifications");
  if (stored) {
    setReadNotifications(new Set(JSON.parse(stored)));
  }

  // Then fetch notifications
  getNotifications();
}, []);


  const markNotificationAsRead = (id) => {
    setReadNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      localStorage.setItem("readNotifications", JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const markAllAsRead = () => {
    const allIds = [
      ...thresholdAlerts.map(n => n.id),
      ...transferRequests.map(n => n.id),
      ...reorderNotifications.map(n => n.id)
    ];
    const newSet = new Set(allIds);
    setReadNotifications(newSet);
    localStorage.setItem("readNotifications", JSON.stringify(Array.from(newSet)));
  };


  const deleteNotification = (id, type) => {
    if (type === "alert") {
      setThresholdAlerts((prev) => prev.filter((n) => n.id !== id));
    } else if (type === "transfer") {
      setTransferRequests((prev) => prev.filter((n) => n.id !== id));
    } else if (type === "reorder") {
      setReorderNotifications((prev) => prev.filter((n) => n.id !== id));
    }
    // Remove from read notifications if it was there
    setReadNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const isNotificationRead = (id) => readNotifications.has(id);

  const getNotificationStyle = (notification, isRead) => {
    const baseStyles = `border-l-4 ${notification.borderColor} rounded-lg p-4 shadow-sm transition-all duration-200 transform hover:scale-[1.02]`;
    
    if (isRead) {
      return `${baseStyles} bg-gray-50 border-l-gray-300 opacity-75`;
    }
    
    return `${baseStyles} ${notification.bgColor} border-l-4 ${notification.borderColor} ring-1 ring-gray-200`;
  };

  const NotificationItem = ({ notification }) => {
    const isRead = isNotificationRead(notification.id);

    return (
      <li className={getNotificationStyle(notification, isRead)}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`mt-1 ${isRead ? "text-gray-400" : notification.iconColor}`}>
              {isRead ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className={`font-semibold ${isRead ? "text-gray-600" : "text-gray-900"}`}>
                  {notification.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    notification.productType === "Manufactured Product"
                      ? "bg-amber-100 text-amber-800"
                      : notification.productType === "Raw Material"
                      ? "bg-green-100 text-green-800"
                      : notification.productType === "Transfer Request"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  } ${isRead ? "opacity-60" : ""}`}
                >
                  {notification.productType}
                </span>
                {!isRead && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className={`mt-1 text-sm ${isRead ? "text-gray-500" : "text-gray-700"}`}>
                {notification.message}
              </p>
              {notification.inventoryName && (
                <p className="mt-1 text-xs text-gray-500">
                  Inventory: {notification.inventoryName}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                {new Date(notification.date).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {!isRead && (
              <button
                onClick={() => markNotificationAsRead(notification.id)}
                className="p-1.5 rounded-lg hover:bg-green-100 transition-colors"
                title="Mark as read"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
              </button>
            )}
            <button
              onClick={() => deleteNotification(notification.id, notification.type)}
              className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
              title="Delete notification"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </li>
    );
  };

  const renderList = (items) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notifications found</p>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === "alerts" 
              ? "No threshold alerts to display" 
              : activeTab === "transfers"
              ? "No transfer requests to display"
              : "No reorder requests to display"
            }
          </p>
        </div>
      );
    }

    const unreadItems = items.filter(item => !isNotificationRead(item.id));
    const readItems = items.filter(item => isNotificationRead(item.id));

    return (
      <div className="space-y-6">
        {unreadItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Unread ({unreadItems.length})
              </h3>
              {unreadItems.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <ul className="space-y-3">
              {unreadItems
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
            </ul>
          </div>
        )}

        {readItems.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Read ({readItems.length})
            </h3>
            <ul className="space-y-3">
              {readItems
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const filteredAlerts = () => {
    if (activeSubTab === "manufactured") {
      return thresholdAlerts.filter((n) => n.productType === "Manufactured Product");
    }
    if (activeSubTab === "raw") {
      return thresholdAlerts.filter((n) => n.productType === "Raw Material");
    }
    return thresholdAlerts;
  };

  const getTotalUnreadCount = () => {
    const allNotifications = [
      ...thresholdAlerts,
      ...transferRequests,
      ...reorderNotifications
    ];
    return allNotifications.filter(n => !isNotificationRead(n.id)).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">Manage your system alerts and requests</p>
          </div>
          <div className="flex items-center space-x-4">
            {getTotalUnreadCount() > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {getTotalUnreadCount()} unread
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Main Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab("alerts")}
                className={`flex items-center px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === "alerts"
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Threshold Alerts
                {thresholdAlerts.filter(n => !isNotificationRead(n.id)).length > 0 && (
                  <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                    {thresholdAlerts.filter(n => !isNotificationRead(n.id)).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("reorders")}
                className={`flex items-center px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === "reorders"
                    ? "border-yellow-500 text-yellow-600 bg-yellow-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Reorder Requests
                {reorderNotifications.filter(n => !isNotificationRead(n.id)).length > 0 && (
                  <span className="ml-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs">
                    {reorderNotifications.filter(n => !isNotificationRead(n.id)).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "alerts" && (
              <>
                {/* Sub Tabs for Alerts */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
                  <button
                    onClick={() => setActiveSubTab("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSubTab === "all"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    All Alerts
                  </button>
                  <button
                    onClick={() => setActiveSubTab("manufactured")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSubTab === "manufactured"
                        ? "bg-white text-amber-700 shadow-sm"
                        : "text-gray-600 hover:text-amber-700"
                    }`}
                  >
                    Manufactured
                  </button>
                  <button
                    onClick={() => setActiveSubTab("raw")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSubTab === "raw"
                        ? "bg-white text-green-700 shadow-sm"
                        : "text-gray-600 hover:text-green-700"
                    }`}
                  >
                    Raw Materials
                  </button>
                </div>
                {renderList(filteredAlerts())}
              </>
            )}
            {activeTab === "transfers" && renderList(transferRequests)}
            {activeTab === "reorders" && renderList(reorderNotifications)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;