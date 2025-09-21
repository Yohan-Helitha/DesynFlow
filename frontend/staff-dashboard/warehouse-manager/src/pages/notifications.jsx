import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { fetchThresholdAlerts } from "../services/FthresholdAlertService.js";
import { fetchTransferRequests } from "../services/FtransferRequestService.js";
import { useNotifications } from "../context/notificationContext.jsx";
import { Trash2 } from "lucide-react";

const Notifications = () => {
  const [localNotifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { markAsRead } = useNotifications();

  // Determine product type based on ID prefix
  const getProductType = (id) => {
    if (!id) return "Unknown";
    if (id.startsWith("MP")) return "Manufactured Product";
    if (id.startsWith("RM")) return "Raw Material";
    if (id.startsWith("TR")) return "Transfer Request";
    return "Unknown";
  };

  const getNotifications = async () => {
    try {
      const alerts = await fetchThresholdAlerts();
      const requests = await fetchTransferRequests();

      // Threshold alerts
      const alertNotifications = alerts.map((a) => ({
        id: a._id,
        type: "alert",
        productType: getProductType(a.materialId),
        title: `Threshold Alert: ${a.materialName}`,
        message: `Current Level: ${a.currentLevel} | Inventory: ${a.inventoryName}`,
        date: a.alertDate,
        borderColor: "border-red-500",
      }));

      // Approved transfer requests
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

      // Merge & sort
      const combined = [...alertNotifications, ...requestNotifications].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setLocalNotifications(combined);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    markAsRead();
    getNotifications();
  }, []);

  const deleteNotification = (id) => {
    setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div>
      <Navbar />
      <div className="m-6 flex justify-center">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>

          <div className="border border-gray-300 p-6 rounded-lg bg-gray-50 shadow">
            {loading ? (
              <p>Loading...</p>
            ) : localNotifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              <ul className="space-y-4">
                {localNotifications.map((n) => (
                  <li
                    key={n.id}
                    className={`flex flex-col md:flex-row md:justify-between items-start md:items-center border-l-4 ${n.borderColor} bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 text-lg">
                        {n.title}
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs rounded ${
                            n.productType === "Manufactured Product"
                              ? "bg-amber-200 text-amber-800"
                              : n.productType === "Raw Material"
                              ? "bg-green-200 text-green-800"
                              : "bg-blue-200 text-blue-800"
                          }`}
                        >
                          {n.productType}
                        </span>
                      </span>
                      <span className="text-gray-600 text-sm mt-1">{n.message}</span>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0 space-x-4">
                      <span className="text-gray-500 text-sm">
                        {new Date(n.date).toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-amber-500 hover:text-amber-600" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
