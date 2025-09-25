
import React, { useState, useEffect } from 'react';
import { CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewInspectionPaymentModal } from './ViewInspectionPaymentModal';

export const InspectionPaymentsHistory = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [sortField, setSortField] = useState('inspectionRequestId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const fetchPendingPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/inspection-estimation/payment-status/filter');
      if (!res.ok) throw new Error('Failed to fetch inspection payments history');
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

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
          <CreditCard size={20} />
        </div>
        <h2 className="text-xl font-semibold text-[#674636]">Inspection Payments History</h2>
      </div>

      {/* Table */}
      <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#F7EED3]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Inspection Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Client ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Site Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Property Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Estimated Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Payment Receipt</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {paginatedPayments.map((payment) => (
                <tr key={payment._id || payment.inspectionRequestId} className="hover:bg-[#F7EED3] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#674636] font-mono text-xs">{payment.inspectionRequestId}</td>
                  <td className="px-6 py-4 text-sm text-[#674636] font-mono text-xs">{payment.clientId || (payment.client && payment.client._id)}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.clientName || (payment.client && payment.client.name)}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.email}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.phone}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.siteLocation}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.propertyType}</td>
                  <td className="px-6 py-4 text-sm text-[#674636] font-semibold">{payment.estimation && payment.estimation.estimatedCost !== undefined ? `$${payment.estimation.estimatedCost.toLocaleString()}` : '-'}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.status || (payment.estimation && payment.estimation.status) || '-'}</td>
                  <td className="px-6 py-4 text-sm text-[#674636] underline cursor-pointer">
                    {payment.paymentReceiptUrl ? (
                      <a href={payment.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#AAB396]">
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-[#AAB396] no-underline">No Receipt</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(payment)}
                      className="text-[#674636] hover:text-[#FFF8E8] bg-[#F7EED3] hover:bg-[#674636] px-3 py-1 rounded-md transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedPayments.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-[#AAB396]">
                    No pending payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sortedPayments.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
            <div className="text-sm text-[#674636]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedPayments.length)} of {sortedPayments.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1 ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#AAB396] hover:text-[#FFF8E8] transition-colors'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md transition-colors ${
                    currentPage === page ? 'bg-[#674636] text-[#FFF8E8]' : 'text-[#674636] hover:bg-[#AAB396] hover:text-[#FFF8E8]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#AAB396] hover:text-[#FFF8E8] transition-colors'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && (
        <ViewInspectionPaymentModal payment={selectedPayment} onClose={() => setShowViewModal(false)} />
      )}
    </div>
  );
};
