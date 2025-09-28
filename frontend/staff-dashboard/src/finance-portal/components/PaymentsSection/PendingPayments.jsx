import React, { useState } from 'react'
import {
  CreditCard,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
} from 'lucide-react'
import { ViewPaymentModal } from './ViewPaymentModal'
import { buildUploadsUrl } from '../../utils/fileUrls'

import { useEffect } from 'react';

export const PendingPayments = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPendingPayments = () => {
    setLoading(true);
    fetch('/api/payments/pending')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch pending payments');
        return res.json();
      })
      .then((data) => {
        setPendingPayments(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);
  if (loading) {
    return <div className="p-8 text-center text-[#AAB396]">Loading pending payments...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const handleView = (payment) => {
    setSelectedPayment(payment)
    setShowViewModal(true)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter + Sort
  const filteredPayments = pendingPayments
    .filter(
      (payment) =>
        (payment._id && payment._id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.projectId && payment.projectId.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.clientId && payment.clientId.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* Header with search */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <CreditCard size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Pending Payments</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search payments..."
              className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#F7EED3] placeholder-[#AAB396] text-[#674636]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Filter size={16} className="text-[#AAB396]" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#F7EED3]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">Project ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">Client ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {paginatedPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-[#F7EED3]">
                  <td className="px-6 py-4 text-sm font-medium text-[#674636]">{payment.projectId}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.clientId}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">${payment.amount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.method}</td>
                  <td className="px-6 py-4 text-sm text-[#674636]">{payment.type}</td>
                  <td className="px-6 py-4 text-sm text-[#674636] underline cursor-pointer">
                    {payment.receiptUrl ? (
                      <a href={buildUploadsUrl(payment.receiptUrl, 'payments')} target="_blank" rel="noopener noreferrer">View Receipt</a>
                    ) : (
                      <span className="text-[#AAB396]">No Receipt</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(payment)}
                      className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white mr-2"
                    >
                      Action
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-[#AAB396]">
                    No pending payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
            <div className="text-sm text-[#674636]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of{' '}
              {filteredPayments.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? 'text-[#AAB396] cursor-not-allowed'
                    : 'text-[#674636] hover:bg-[#FFF8E8]'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md ${
                    currentPage === page
                      ? 'bg-[#674636] text-[#FFF8E8]'
                      : 'text-[#674636] hover:bg-[#FFF8E8]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? 'text-[#AAB396] cursor-not-allowed'
                    : 'text-[#674636] hover:bg-[#FFF8E8]'
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
        <ViewPaymentModal
          payment={selectedPayment}
          onClose={() => {
            setShowViewModal(false);
            fetchPendingPayments();
          }}
        />
      )}
    </div>
  )
}
