// requestTable.jsx - Simplified CSR Inspection Request Table
import React, { useState, useEffect } from "react";
import axios from "axios";

const RequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedInspector, setSelectedInspector] = useState({});

  // Fetch all inspection requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/inspection-request", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests || res.data || []);
    } catch (err) {
      setMessage("Failed to load inspection requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available inspectors
  const fetchInspectors = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/user/inspectors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInspectors(res.data.users || res.data || []);
    } catch (err) {
      console.error("Failed to load inspectors:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchInspectors();
  }, []);

  // Update request status (only essential statuses)
  const updateStatus = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.patch(
        `http://localhost:5000/api/inspection-request/${requestId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Status updated to "${newStatus}"`);
      fetchRequests();
    } catch (err) {
      setMessage("Failed to update status.");
      console.error(err);
    }
  };

  // Assign inspector to request
  const assignInspector = async (requestId) => {
    const inspectorId = selectedInspector[requestId];
    if (!inspectorId) {
      setMessage("Please select an inspector first.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:5000/api/assignment/assign",
        { inspectionRequestId: requestId, inspectorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update request status to 'assigned'
      await updateStatus(requestId, "assigned");
      setMessage("Inspector assigned successfully!");
      setSelectedInspector(prev => ({ ...prev, [requestId]: "" }));
    } catch (err) {
      setMessage("Failed to assign inspector.");
      console.error(err);
    }
  };

  // Generate payment link
  const generatePaymentLink = async (request) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        "http://localhost:5000/api/payment-receipt/generate-payment-link",
        {
          inspectionRequestId: request._id,
          clientId: request.client_ID,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Payment link generated: ${res.data.uploadUrl}`);
      await updateStatus(request._id, "payment-required");
    } catch (err) {
      setMessage("Failed to generate payment link.");
      console.error(err);
    }
  };

  const handleInspectorSelect = (requestId, inspectorId) => {
    setSelectedInspector(prev => ({ ...prev, [requestId]: inspectorId }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        CSR Portal - Inspection Requests
      </h2>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading requests...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rooms/Floors</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No inspection requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{request._id.slice(-6)}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{request.client_name}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                      <div className="text-sm text-gray-500">{request.phone_number}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{request.propertyType}</div>
                      <div className="text-sm text-gray-500">{request.propertyLocation_address}</div>
                      <div className="text-sm text-gray-500">{request.propertyLocation_city}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {request.number_of_room} rooms / {request.number_of_floor} floor(s)
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={request.status}
                        onChange={(e) => updateStatus(request._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="payment-required">Payment Required</option>
                        <option value="assigned">Assigned</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedInspector[request._id] || ""}
                            onChange={(e) => handleInspectorSelect(request._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-1 py-1 max-w-32"
                          >
                            <option value="">Select Inspector</option>
                            {inspectors.map((inspector) => (
                              <option key={inspector._id} value={inspector._id}>
                                {inspector.username}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => assignInspector(request._id)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            Assign
                          </button>
                        </div>

                        <button
                          onClick={() => generatePaymentLink(request)}
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Generate Payment Link
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestTable;
