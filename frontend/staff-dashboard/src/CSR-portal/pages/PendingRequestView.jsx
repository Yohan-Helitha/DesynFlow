import React, { useState, useEffect } from "react";
import axios from "axios";

const PendingRequestView = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedInspector, setSelectedInspector] = useState({});

  // Fetch only pending inspection requests
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/inspection-request", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter only pending requests
      const allRequests = res.data.requests || res.data || [];
      const pendingOnly = allRequests.filter(request => request.status === "pending");
      setPendingRequests(pendingOnly);
    } catch (err) {
      setMessage("Failed to load pending requests.");
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
        headers: { Authorization: `Bearer ${token}` }
      });
      setInspectors(res.data.users || res.data || []);
    } catch (err) {
      console.error("Failed to load inspectors:", err);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    fetchInspectors();
  }, []);

  // Calculate inspection amount (same logic as requestTable)
  const calculateAmount = (request) => {
    const baseRate = 50; // Base rate per room
    const floorMultiplier = request.number_of_floor || 1;
    const roomCount = request.number_of_room || 1;
    return baseRate * roomCount * floorMultiplier;
  };

  // Generate payment link (moves request from pending to payment-required)
  const generatePaymentLink = async (request) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        "http://localhost:5000/api/payment-receipt/generate-payment-link",
        {
          inspectionRequestId: request._id,
          clientId: request.client_ID,
          calculatedAmount: calculateAmount(request),
          paymentDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(`Payment link generated: ${res.data.uploadUrl}`);
      
      // Update status to payment-required
      await updateStatus(request._id, "payment-required");
      
      // Refresh pending requests (this request will be removed from view)
      fetchPendingRequests();
    } catch (err) {
      setMessage("Failed to generate payment link.");
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
        {
          inspectionRequestId: requestId,
          inspectorId: inspectorId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update request status to 'assigned'
      await updateStatus(requestId, "assigned");
      setMessage("Inspector assigned successfully!");
      
      // Clear selection and refresh
      setSelectedInspector(prev => ({ ...prev, [requestId]: "" }));
      fetchPendingRequests(); // This request will be removed from pending view
    } catch (err) {
      setMessage("Failed to assign inspector.");
      console.error(err);
    }
  };

  // Update request status
  const updateStatus = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.patch(
        `http://localhost:5000/api/inspection-request/${requestId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      throw err;
    }
  };

  // Handle inspector selection
  const handleInspectorSelect = (requestId, inspectorId) => {
    setSelectedInspector(prev => ({
      ...prev,
      [requestId]: inspectorId
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Pending Inspection Requests</h2>
      <p className="text-gray-600 mb-6">
        New requests awaiting initial processing - assign inspector or generate payment link
      </p>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading pending requests...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Requests</h3>
              <p className="text-gray-500">All inspection requests have been processed!</p>
            </div>
          ) : (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property Info</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimated Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        #{request._id.slice(-6)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{request.client_name}</div>
                      <div className="text-xs text-gray-500">{request.email}</div>
                      <div className="text-xs text-gray-500">{request.phone_number}</div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 capitalize">{request.propertyType}</div>
                      <div className="text-xs text-gray-500">{request.propertyLocation_address}</div>
                      <div className="text-xs text-gray-500">{request.propertyLocation_city}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {request.number_of_room} rooms • {request.number_of_floor} floor(s)
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="text-lg font-semibold text-green-600">
                        ${calculateAmount(request)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${calculateAmount(request) / (request.number_of_room || 1)} per room
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex flex-col space-y-2">
                        {/* Quick Actions */}
                        <button
                          onClick={() => generatePaymentLink(request)}
                          className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Generate Payment Link
                        </button>
                        
                        {/* Inspector Assignment */}
                        <div className="flex space-x-1">
                          <select
                            value={selectedInspector[request._id] || ""}
                            onChange={(e) => handleInspectorSelect(request._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-1 py-1 flex-1"
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
                            disabled={!selectedInspector[request._id]}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:bg-gray-300"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Summary Stats */}
      {pendingRequests.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-900 font-medium">
              Total estimated: ${pendingRequests.reduce((sum, req) => sum + calculateAmount(req), 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequestView;
