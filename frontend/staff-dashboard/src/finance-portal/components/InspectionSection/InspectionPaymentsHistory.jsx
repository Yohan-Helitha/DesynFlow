
import React, { useState, useEffect } from 'react';
import { CreditCard, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { ViewInspectionPaymentModal } from './ViewInspectionPaymentModal';

export const InspectionPaymentsHistory = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('inspectionRequestId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Build a full URL to the uploaded receipt that works in dev and prod and normalizes slashes
  const buildReceiptUrl = (payment) => {
    const raw = payment?.paymentReceiptUrl || payment?.receiptUrl;
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    let normalized = String(raw).replace(/\\/g, '/');
    const lower = normalized.toLowerCase();
    const base = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';

    let idx = lower.indexOf('/uploads/');
    if (idx !== -1) {
      let path = normalized.slice(idx);
      if (!path.startsWith('/')) path = `/${path}`;
      return `${base}${path}`;
    }
    idx = lower.indexOf('uploads/');
    if (idx !== -1) {
      let path = normalized.slice(idx);
      if (!path.startsWith('/')) path = `/${path}`;
      return `${base}${path}`;
    }
    idx = lower.indexOf('server/uploads/');
    if (idx !== -1) {
      let path = normalized.slice(idx + 'server'.length);
      if (!path.startsWith('/')) path = `/${path}`;
      return `${base}${path}`;
    }
    const fileName = normalized.split('/').filter(Boolean).pop();
    return `${base}/uploads/inspection_payments/${fileName}`;
  };

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

  const sortedPayments = [...pendingPayments]
    .filter((payment) => {
      const q = (searchTerm || '').toLowerCase();
      const idStr = String(payment._id || payment.inspectionRequestId || '').toLowerCase();
      const nameStr = String(payment.client_name || payment.clientName || '').toLowerCase();
      const emailStr = String(payment.email || '').toLowerCase();
      const siteParts = [payment.propertyLocation_address, payment.propertyLocation_city].filter(Boolean).join(' ').toLowerCase();
      const legacySite = String(payment.siteLocation || '').toLowerCase();
      return [idStr, nameStr, emailStr, siteParts, legacySite].some((v) => v.includes(q));
    })
    .sort((a, b) => {
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <CreditCard size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Inspection Payments History</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search payment history..."
            className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#F7EED3] placeholder-[#AAB396] text-[#674636]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Filter size={16} className="text-[#AAB396]" />
          </button>
        </div>
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
                  <td className="px-6 py-4 text-sm font-medium text-[#674636] font-mono text-xs">{String(payment._id || payment.inspectionRequestId || '')}</td>
                  <td className="px-6 py-4 text-sm text-[#674636] font-mono text-xs">{String(payment.client_ID || payment.clientId || (payment.client && payment.client._id) || '-')}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.client_name || payment.clientName || (payment.client && payment.client.name) || '-'}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.phone_number || payment.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{[payment.propertyLocation_address, payment.propertyLocation_city].filter(Boolean).join(', ') || payment.siteLocation || '-'}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.propertyType || '-'}</td>
                  <td className="px-6 py-4 text-sm text-[#674636] font-semibold">{payment.estimation && payment.estimation.estimatedCost !== undefined ? `$${payment.estimation.estimatedCost.toLocaleString()}` : '-'}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.status || (payment.estimation && payment.estimation.status) || '-'}</td>
                  <td className="px-6 py-4 text-sm text-[#674636] underline cursor-pointer">
                    {payment.paymentReceiptUrl || payment.receiptUrl ? (
                      <a href={buildReceiptUrl(payment)} target="_blank" rel="noopener noreferrer" className="hover:text-[#AAB396]">
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
