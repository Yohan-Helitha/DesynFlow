// requestTable.jsx - Simplified CSR Inspection Request Table
import React, { useState, useEffect } from "react";
import axios from "axios";

const RequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch all inspection requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/inspection-request/client", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests || []);
    } catch {
      setMessage("❌ Failed to load inspection requests.");
    }
  };

  // Fetch available inspectors
  const fetchInspectors = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/user/inspectors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInspectors(res.data.users || []);
    } catch {
      console.error("Failed to load inspectors");
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchInspectors();
  }, []);

  // Generate payment link
  const generatePaymentLink = async (req) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:5000/api/payment-receipt/generate-payment-link",
        {
          inspectionRequestId: req._id,
          clientId: req.client_ID,
          calculatedAmount: 100, // simple demo amount
          paymentDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Payment link generated");
      fetchRequests();
    } catch {
      setMessage("❌ Failed to generate payment link");
    }
  };

  // Assign inspector
  const assignInspector = async (reqId, inspectorId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:5000/api/assignment/assign",
        { inspectionRequestId: reqId, inspectorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Inspector assigned");
      fetchRequests();
    } catch {
      setMessage("❌ Failed to assign inspector");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">All Inspection Requests</h2>
      {message && <p className="mb-4 text-blue-600">{message}</p>}

      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Property</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id} className="border-t">
                <td className="p-2">
                  <div>{req.client_name}</div>
                  <div className="text-xs text-gray-500">{req.email}</div>
                </td>
                <td className="p-2">{req.propertyLocation_city}</td>
                <td className="p-2 capitalize">{req.status}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => generatePaymentLink(req)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Payment Link
                  </button>

                  <select
                    onChange={(e) => assignInspector(req._id, e.target.value)}
                    className="border px-2 py-1 text-sm"
                  >
                    <option value="">Assign Inspector</option>
                    {inspectors.map((i) => (
                      <option key={i._id} value={i._id}>
                        {i.username}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RequestTable;
