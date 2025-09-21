import React, { useState } from 'react';

export const PaymentActionModal = ({ payment, onClose }) => {
  const [enteredValue, setEnteredValue] = useState('');
  const estimatedCost = payment.estimation && payment.estimation.estimatedCost;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/inspection-estimation/${payment.inspectionRequestId}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: enteredValue,
          status, // 'Approved' or 'Rejected'
        }),
      });
      if (!res.ok) throw new Error('Failed to update payment status');
      onClose(true);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const isApproveEnabled =
    enteredValue !== '' &&
    !isNaN(Number(enteredValue)) &&
    estimatedCost !== undefined &&
    Number(enteredValue) >= Number(estimatedCost);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Payment Action</h2>
        <p className="text-sm text-gray-500 mb-4">
          Do you want to approve or reject the payment for {payment.clientName}?
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Enter Payment Amount</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={enteredValue}
            onChange={e => setEnteredValue(e.target.value)}
            placeholder="Enter payment amount"
          />
        </div>
        <div className="mb-4 text-sm text-gray-600">
          Estimated Cost: <span className="font-semibold">{estimatedCost !== undefined ? estimatedCost : '-'}</span>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => handleVerify('Rejected')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            disabled={loading}
          >
            Reject
          </button>
          <button
            onClick={() => handleVerify('Approved')}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${!isApproveEnabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isApproveEnabled || loading}
          >
            {loading ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};
