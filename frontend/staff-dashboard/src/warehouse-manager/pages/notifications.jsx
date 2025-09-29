import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { fetchThresholdAlerts } from "../services/FthresholdAlertService.js";
import { fetchTransferRequests } from "../services/FtransferRequestService.js";
import { fetchSReorderRequests } from "../services/FsReorderRequestService.js";
import { useNotifications } from "../context/notificationContext.jsx";
import { Trash2 } from "lucide-react";

const Notifications = () => {
  const [thresholdAlerts, setThresholdAlerts] = useState([]);
  const [transferRequests, setTransferRequests] = useState([]);
  const [reorderNotifications, setReorderNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("alerts");
  const [activeSubTab, setActiveSubTab] = useState("all");
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
    markAsRead();
    getNotifications();
  }, []);

  const deleteNotification = (id, type) => {
    if (type === "alert") {
      setThresholdAlerts((prev) => prev.filter((n) => n.id !== id));
    } else if (type === "transfer") {
      setTransferRequests((prev) => prev.filter((n) => n.id !== id));
    } else if (type === "reorder") {
      setReorderNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const renderList = (items) => {
    if (loading) return <p>Loading...</p>;
    if (items.length === 0) return <p>No notifications</p>;

    return (
      <ul className="space-y-4">
        {items
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((n) => (
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
                        : n.productType === "Transfer Request"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {n.productType}
                  </span>
                </span>
                <span className="text-gray-600 text-sm mt-1">
                  {n.message}
                  {n.inventoryName && (
                    <span className="block text-gray-500 text-xs mt-1">
                      Inventory: {n.inventoryName}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center mt-2 md:mt-0 space-x-4">
                <span className="text-gray-500 text-sm">
                  {new Date(n.date).toLocaleString()}
                </span>
                <button
                  onClick={() => deleteNotification(n.id, n.type)}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-amber-500 hover:text-amber-600" />
                </button>
              </div>
            </li>
          ))}
      </ul>
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

  return (
    <div>
      <Navbar />
      <div className="m-6 flex justify-center">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>

          {/* Main Tabs */}
          <div className="flex border-b border-gray-300 mb-6">
            <button
              onClick={() => setActiveTab("alerts")}
              className={`px-4 py-2 font-medium ${
                activeTab === "alerts"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Threshold Alerts
            </button>
            <button
              onClick={() => setActiveTab("transfers")}
              className={`px-4 py-2 font-medium ml-4 ${
                activeTab === "transfers"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Transfer Requests
            </button>
            <button
              onClick={() => setActiveTab("reorders")}
              className={`px-4 py-2 font-medium ml-4 ${
                activeTab === "reorders"
                  ? "border-b-2 border-yellow-500 text-yellow-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Reorder Requests
            </button>
          </div>

          <div className="border border-gray-300 p-6 rounded-lg bg-gray-50 shadow">
            {activeTab === "alerts" && (
              <>
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveSubTab("manufactured")}
                    className={`px-3 py-1 text-sm font-medium ${
                      activeSubTab === "manufactured"
                        ? "border-b-2 border-amber-500 text-amber-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Manufactured Products
                  </button>
                  <button
                    onClick={() => setActiveSubTab("raw")}
                    className={`px-3 py-1 ml-3 text-sm font-medium ${
                      activeSubTab === "raw"
                        ? "border-b-2 border-green-500 text-green-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Raw Materials
                  </button>
                  <button
                    onClick={() => setActiveSubTab("all")}
                    className={`px-3 py-1 ml-3 text-sm font-medium ${
                      activeSubTab === "all"
                        ? "border-b-2 border-blue-400 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All
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
