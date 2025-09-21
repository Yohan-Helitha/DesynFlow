import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { fetchTransferRequests, deleteTransferRequest } from "../services/FtransferRequestService.js";
import { Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TransferRequest = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  // Fetch transfer requests
  const getRequests = async () => {
    try {
      const data = await fetchTransferRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch transfer requests:", err);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this transfer request?");
    if (!confirmDelete) return;

    try {
      await deleteTransferRequest(id);
      await getRequests();
      alert("Transfer request deleted successfully!");
    } catch (err) {
      console.error("Failed to delete transfer request:", err);
      alert("Failed to delete transfer request.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Transfer Requests</h1>
          <button
            className="bg-amber-900 hover:bg-bamber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/add-transfer-request")}
          >
            + Add Transfer Request
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Transfer Request ID</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48">From Location</th>
                <th className="border border-gray-300 px-4 py-2 w-48">To Location</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 w-56">Reason</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Requested By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Approved By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Status</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Required By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Updated At</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs bg-white">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request._id}>
                    {/* Actions */}
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                      <div className="flex items-center justify-center gap-6">
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => navigate(`/update-transfer-request/${request._id}`)}
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
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">{request.transferRequestId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{request.fromLocation}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{request.toLocation}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 w-56">{request.reason}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{request.requestedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{request.approvedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.status}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{request.requiredBy ? new Date(request.requiredBy).toLocaleDateString() : "-"}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{request.createdAt ? new Date(request.createdAt).toLocaleString() : "-"}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{request.updatedAt ? new Date(request.updatedAt).toLocaleString() : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="text-center p-4">No transfer requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransferRequest;