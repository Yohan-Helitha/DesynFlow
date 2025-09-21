
import React, { useState, useEffect } from 'react';
import { CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaymentActionModal } from './PaymentActionModal';

export const InspectionPayments = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [sortField, setSortField] = useState('inspectionRequestId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const fetchPendingPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/inspection-estimation/payment-pending');
      if (!res.ok) throw new Error('Failed to fetch pending payments');
      const data = await res.json();
      setPendingPayments(data);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPayments = [...pendingPayments].sort((a, b) => {
    if (!a[sortField] || !b[sortField]) return 0;
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);
  const paginatedPayments = sortedPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAction = (payment) => {
    setSelectedPayment(payment);
    setShowActionModal(true);
  };

  const handleActionModalClose = (shouldRefresh = false) => {
    setShowActionModal(false);
    setSelectedPayment(null);
    if (shouldRefresh) fetchPendingPayments();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 mr-3">
          <CreditCard size={20} />
        </div>
        <h2 className="text-xl font-semibold">Pending Payments</h2>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspection Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimated Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Receipt</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.map((payment) => (
                <tr key={payment._id || payment.inspectionRequestId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.inspectionRequestId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.clientId || (payment.client && payment.client._id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.clientName || (payment.client && payment.client.name)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.siteLocation}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.propertyType}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.estimation && payment.estimation.estimatedCost !== undefined ? payment.estimation.estimatedCost : '-'}</td>
                  <td className="px-6 py-4 text-sm text-indigo-600 underline cursor-pointer">
                    {payment.paymentReceiptUrl ? (
                      <a href={payment.paymentReceiptUrl} target="_blank" rel="noopener noreferrer">
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-gray-400">No Receipt</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleAction(payment)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md"
                    >
                      Take Action
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedPayments.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                    No pending payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sortedPayments.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedPayments.length)} of {sortedPayments.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md ${
                    currentPage === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <PaymentActionModal payment={selectedPayment} onClose={handleActionModalClose} />
      )}
    </div>
  );
};
