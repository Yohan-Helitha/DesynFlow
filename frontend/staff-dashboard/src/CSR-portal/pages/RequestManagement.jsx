// RequestManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const RequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch inspection requests for CSR
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/inspection-requests"); // Adjust if your route is different
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load inspection requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle generate payment link
  const generatePaymentLink = async (requestId, clientId, calculatedAmount) => {
    try {
      const res = await axios.post("/api/payment-receipt/generate-payment-link", {
        inspectionRequestId: requestId,
        clientId,
        calculatedAmount,
        paymentDueDate: new Date() // or calculate due date
      });
      setMessage(`Payment link created: ${res.data.uploadUrl}`);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to generate payment link.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>CSR: Inspection Requests</h2>
      {message && <p>{message}</p>}
      {loading ? (
        <p>Loading requests...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Client Name</th>
              <th>Property</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan="5">No inspection requests found.</td>
              </tr>
            )}
            {requests.map((req) => (
              <tr key={req._id}>
                <td>{req._id}</td>
                <td>{req.client.name}</td>
                <td>{req.propertyLocation?.address || "-"}</td>
                <td>${req.calculatedAmount || "-"}</td>
                <td>
                  <button
                    onClick={() =>
                      generatePaymentLink(req._id, req.client._id, req.calculatedAmount)
                    }
                  >
                    Generate Payment Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RequestManagement;
