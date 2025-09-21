import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { fetchSReorderRequests, deleteSReorderRequest } from "../services/FsReorderRequestService.js";
import { Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SReorderRequest = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  // Fetch stock reorder requests
  const getRequests = async () => {
    try {
      const data = await fetchSReorderRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch stock reorder requests:", err);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this request?");
    if (!confirmDelete) return;

    try {
      await deleteSReorderRequest(id);
      await getRequests();
      alert("Stock Reorder Request deleted successfully!");
    } catch (err) {
      console.error("Failed to delete request:", err);
      alert("Failed to delete request.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Stock Reorder Requests</h1>
          <button
            className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/add-s-reorder-requests")}
          >
            + Add Reorder Request
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative">Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative">Request ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Inventory Name</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Inventory Address</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Inventory Contact</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Material Name</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Type</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Unit</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Expected Date</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Warehouse Manager</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Status</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs bg-white">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request._id}>
                    {/* Actions */}
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40 relative">
                      <div className="flex items-center justify-center gap-6">
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => navigate(`/update-s-reorder-requests/${request._id}`)}
                        >
                          <Edit2 className="w-5 h-5  text-amber-500 hover:text-amber-600" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100">
                            Update
                          </span>
                        </div>
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => handleDelete(request._id)}
                        >
                          <Trash2 className="w-5 h-5  text-amber-500 hover:text-amber-600" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Table Data */}
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40 relative">{request.stockReorderRequestId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{request.inventoryName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{request.inventoryAddress}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{request.inventoryContact}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{request.materialName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{request.type}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.unit}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.expectedDate ? new Date(request.expectedDate).toLocaleDateString() : "-"}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{request.warehouseManagerName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.status}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{request.createdAt ? new Date(request.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="text-center p-4">No stock reorder requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SReorderRequest;
