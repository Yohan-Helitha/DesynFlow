
import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { ViewHistoryModal } from './ViewHistoryModal';

export const PendingInspections = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyType, setHistoryType] = useState('estimate');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/inspection-estimation/pending')
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => setPending(Array.isArray(data) ? data : []))
      .catch(e => setError('Failed to load pending inspections'))
      .finally(() => setLoading(false));
  }, []);

  const handleViewEstimateHistory = async (inspectionRequestId) => {
    setLoading(true);
    setError(null);
    setHistoryType('estimate');
    try {
      const res = await fetch(`/api/inspection-estimation/${inspectionRequestId}`);
      if (!res.ok) throw new Error('Failed to fetch details');
      const details = await res.json();
      // For demo, treat the single estimate as history; extend as needed
      const est = details.estimation;
      setHistoryData(est ? [{
        distance: est.distanceKm,
        estimatedCost: est.estimatedCost,
        generatedBy: est.createdBy || '-',
        date: est.createdAt ? new Date(est.createdAt).toLocaleDateString() : '-'
      }] : []);
      setShowHistory(true);
    } catch (e) {
      setError('Failed to load estimate history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pending Inspections</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pending.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No pending inspections
                  </td>
                </tr>
              ) : (
                pending.map((item) => (
                  <tr key={item.inspectionRequestId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.siteLocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.propertyType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewEstimateHistory(item.inspectionRequestId)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye size={16} className="inline mr-1" /> Estimate History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showHistory && (
        <ViewHistoryModal
          historyData={historyData}
          type={historyType}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export const PaymentActionModal = ({ payment, actionType, onClose }) => {
  const [rejectionReason, setRejectionReason] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would update the payment status in your backend
    console.log('Updating payment status:', {
      paymentId: payment.id,
      action: actionType,
      ...(actionType === 'reject' && {
        reason: rejectionReason,
      }),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">
            {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Client Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm mb-1">
                  <span className="font-medium">Name:</span> {payment.clientName}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Email:</span> {payment.clientEmail}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {payment.clientPhone}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Payment Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm mb-1">
                  <span className="font-medium">Amount:</span> ${payment.amountPaid}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Submission Date:</span> {payment.submittedDate}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Receipt:</span>{' '}
                  <a
                    href={payment.paymentReceipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Receipt
                  </a>
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {actionType === 'approve' ? (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
                <Check size={20} className="text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Confirm Payment Approval
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    You are about to approve a payment of ${payment.amountPaid}{' '}
                    for inspection {payment.id}. This action cannot be undone.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                  <AlertTriangle size={20} className="text-red-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Confirm Payment Rejection
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      You are about to reject a payment of ${payment.amountPaid}{' '}
                      for inspection {payment.id}. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="rejectionReason"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Rejection Reason
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    placeholder="Please provide a reason for rejecting this payment"
                  ></textarea>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
