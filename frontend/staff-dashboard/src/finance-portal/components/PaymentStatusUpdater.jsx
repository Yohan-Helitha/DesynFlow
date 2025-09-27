import React, { useState } from "react";

const PaymentStatusUpdater = ({ receiptId, authToken, onStatusUpdated }) => {
  const [status, setStatus] = useState("verified"); // default
  const [financeRemarks, setFinanceRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    if (!receiptId) {
      setMessage("❌ No receipt selected.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `http://localhost:4000/api/payment-receipt/verify/${receiptId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ status, financeRemarks, rejectionReason }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Payment ${status} successfully!`);
        if (onStatusUpdated) onStatusUpdated(data); // callback for parent component
      } else {
        setMessage(`❌ ${data.message || "Update failed."}`);
      }
    } catch (err) {
      setMessage("❌ Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-3">Update Payment Status</h2>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="verified">✅ Verified</option>
          <option value="rejected">❌ Rejected</option>
        </select>
      </div>

      {status === "rejected" && (
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Rejection Reason
          </label>
          <input
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Why is this rejected?"
          />
        </div>
      )}

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Remarks</label>
        <textarea
          value={financeRemarks}
          onChange={(e) => setFinanceRemarks(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Additional notes..."
        />
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Status"}
      </button>

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
};

export default PaymentStatusUpdater;
