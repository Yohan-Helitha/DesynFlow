import React, { useState, useEffect } from "react";
import axios from "axios";

const InspectionPaymentView = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all payment receipts for CSR view
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("/api/payment-receipt/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data.receipts || []);
    } catch (error) {
      setMessage("❌ Failed to load payment data.");
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update payment status (CSR can verify payments)
  const updatePaymentStatus = async (receiptId, status) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.patch(
        `/api/payment-receipt/verify/${receiptId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ Payment ${status} successfully`);
      fetchPayments(); // Refresh data
    } catch (error) {
      setMessage("❌ Failed to update payment status.");
      console.error("Error updating payment:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading payment data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Inspection Payment Management</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{payment.inspectionRequestId ? payment.inspectionRequestId.slice(-6) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.clientId?.username || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{payment.clientId?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.calculatedAmount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'verified' 
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentDueDate 
                        ? new Date(payment.paymentDueDate).toLocaleDateString()
                        : 'Not set'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {payment.status !== 'verified' && (
                        <button
                          onClick={() => updatePaymentStatus(payment._id, 'verified')}
                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded"
                        >
                          Verify
                        </button>
                      )}
                      {payment.status !== 'rejected' && (
                        <button
                          onClick={() => updatePaymentStatus(payment._id, 'rejected')}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">CSR Payment Management</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Review payment receipts submitted by clients</li>
          <li>• Verify payment authenticity and amounts</li>
          <li>• Approve or reject payments for processing</li>
          <li>• Monitor payment due dates and overdue accounts</li>
        </ul>
      </div>
    </div>
  );
};

export default InspectionPaymentView;
