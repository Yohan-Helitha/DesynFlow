import React, { useState } from 'react';

export const PaymentActionModal = ({ payment, onClose }) => {
  const [enteredValue, setEnteredValue] = useState('');
  const estimatedCost = payment.estimation && payment.estimation.estimatedCost;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (actionStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/inspection-estimation/${payment.inspectionRequestId}/verify-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentAmount: Number(enteredValue),
            status: actionStatus,
          }),
        }
      );
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
      <div className="bg-[#FFF8E8] p-6 rounded-lg shadow-lg w-full max-w-md border border-[#AAB396]">
        <h2 className="text-xl font-bold mb-4 text-[#674636]">Payment Action</h2>
        <p className="text-sm text-[#674636] mb-4">
          Do you want to approve or reject the payment for{' '}
          <span className="font-semibold">{payment.clientName}</span>?
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#674636] mb-1">
            Enter Payment Amount
          </label>
          <input
            type="number"
            className="w-full border border-[#AAB396] rounded-md px-3 py-2 bg-[#F7EED3] focus:outline-none focus:ring-2 focus:ring-[#674636]"
            value={enteredValue}
            onChange={(e) => setEnteredValue(e.target.value)}
            placeholder="Enter payment amount"
          />
        </div>
        <div className="mb-4 text-sm text-[#674636]">
          Estimated Cost:{' '}
          <span className="font-semibold">
            {estimatedCost !== undefined ? estimatedCost : '-'}
          </span>
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F7EED3] text-[#674636] border border-[#AAB396] rounded-md hover:bg-[#AAB396] hover:text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => handleVerify('RejectedApproved')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-400"
            disabled={loading}
          >
            Reject
          </button>
          <button
            onClick={() => handleVerify('Rejected')}
            className={`px-4 py-2 bg-[#674636] text-white rounded-md hover:bg-[#AAB396] focus:ring-2 focus:ring-[#674636] ${
              !isApproveEnabled || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isApproveEnabled || loading}
          >
            {loading ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};
