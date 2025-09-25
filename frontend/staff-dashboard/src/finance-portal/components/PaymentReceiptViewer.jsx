import React, { useEffect, useState } from "react";

const PaymentReceiptViewer = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch all receipts (for CSR/Finance/Admin)
  const fetchReceipts = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/payment-receipt/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReceipts(data.receipts || []);
      } else {
        setMessage(`❌ ${data.message || "Failed to load receipts"}`);
      }
    } catch (err) {
      setMessage("❌ Server error while fetching receipts");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete receipt (Admin only – needs DELETE endpoint in backend)
  const handleDelete = async (receiptId) => {
    if (!window.confirm("Are you sure you want to delete this receipt?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:5000/api/payment-receipt/${receiptId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Receipt deleted successfully");
        setReceipts(receipts.filter((r) => r._id !== receiptId));
      } else {
        setMessage(`❌ ${data.message || "Failed to delete receipt"}`);
      }
    } catch (err) {
      setMessage("❌ Server error while deleting receipt");
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Payment Receipts</h2>

      {message && <p className="mb-4">{message}</p>}

      {loading ? (
        <p>Loading receipts...</p>
      ) : receipts.length === 0 ? (
        <p>No receipts found</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Property</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Uploaded</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-2 border">{r.client?.name || "N/A"}</td>
                <td className="p-2 border">
                  {r.inspectionRequest?.propertyLocation?.address || "N/A"}
                </td>
                <td className="p-2 border">${r.calculatedAmount}</td>
                <td className="p-2 border">{r.status}</td>
                <td className="p-2 border">
                  {r.tokenUsedAt
                    ? new Date(r.tokenUsedAt).toLocaleString()
                    : "Not uploaded"}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
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

export default PaymentReceiptViewer;
