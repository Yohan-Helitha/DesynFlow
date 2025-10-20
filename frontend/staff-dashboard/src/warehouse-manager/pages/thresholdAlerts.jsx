// src/pages/ThresholdAlerts.jsx
import Navbar from "../component/navbar";
import React, { useState, useEffect } from "react";
import { fetchThresholdAlerts, deleteThresholdAlert } from "../services/FthresholdAlertService.js";
import { Trash2 } from "lucide-react";

const ThresholdAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts
  const getAlerts = async () => {
    try {
      const data = await fetchThresholdAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAlerts();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this alert?");
    if (!confirmDelete) return;

    try {
      await deleteThresholdAlert(id);
      setAlerts(alerts.filter((a) => a._id !== id));
      alert("Alert deleted successfully!");
    } catch (err) {
      console.error("Failed to delete alert:", err);
      alert("Failed to delete alert.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      <div className="m-6 ">
        <h1 className="text-2xl font-bold mt-6 mb-10">Threshold Alerts</h1>

        <div className="overflow-x-auto">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40">
                  Actions
                </th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40">
                  Alert ID
                </th>
                <th className="border border-gray-300 px-4 py-2">Material ID</th>
                <th className="border border-gray-300 px-4 py-2">Material Name</th>
                <th className="border border-gray-300 px-4 py-2">Current Level</th>
                <th className="border border-gray-300 px-4 py-2">Restock Level</th>
                <th className="border border-gray-300 px-4 py-2">Inventory Name</th>
                <th className="border border-gray-300 px-4 py-2">Alert Date</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 font-semibold">
                    Loading...
                  </td>
                </tr>
              ) : alerts.length > 0 ? (
                alerts.map((alert) => (
                  <tr key={alert._id}>
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40">
                      <div className="flex items-center justify-center gap-4">
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => handleDelete(alert._id)}
                        >
                          <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40">
                      {alert.alertId}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{alert.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2">{alert.materialName}</td>
                    <td className="border border-gray-300 px-4 py-2">{alert.currentLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{alert.restockLevel}</td>
                    <td className="border border-gray-300 px-4 py-2">{alert.inventoryName}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(alert.alertDate).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4">
                    No alerts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ThresholdAlerts;