import React, { useEffect, useState } from "react";

const PaymentDashboard = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch all payment receipts
  const fetchReceipts = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:4000/api/payment-receipt/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReceipts(data.receipts || []);
      } else {
        setMessage(`❌ ${data.message || "Failed to fetch receipts"}`);
      }
    } catch (err) {
      setMessage("❌ Server error while fetching receipts");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify / Reject payment receipt
  const handleUpdateStatus = async (receiptId, status) => {
    setMessage("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:4000/api/payment-receipt/verify/${receiptId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Receipt ${status} successfully`);
        fetchReceipts(); // Refresh list
      } else {
        setMessage(`❌ ${data.message || "Failed to update status"}`);
      }
    } catch (err) {
      setMessage("❌ Server error while updating status");
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Payment Dashboard</h1>

      {message && <p className="mb-4">{message}</p>}

      {loading ? (
        <p>Loading receipts...</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Property</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No receipts found
                </td>
              </tr>
            ) : (
              receipts.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-2 border">
                    {r.client?.name} <br />
                    <span className="text-sm text-gray-600">
                      {r.client?.email}
                    </span>
                  </td>
                  <td className="p-2 border">
                    {r.inspectionRequest?.propertyLocation?.address ||
                      "N/A"}
                  </td>
                  <td className="p-2 border">${r.calculatedAmount}</td>
                  <td className="p-2 border">{r.status}</td>
                  <td className="p-2 border">
                    {r.status === "uploaded" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(r._id, "verified")}
                          className="px-2 py-1 bg-green-500 text-white rounded"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(r._id, "rejected")}
                          className="px-2 py-1 bg-red-500 text-white rounded"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">No action</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentDashboard;
