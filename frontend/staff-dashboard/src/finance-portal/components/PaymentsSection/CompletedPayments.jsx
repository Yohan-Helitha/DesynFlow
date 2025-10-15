import React, { useState, useEffect } from 'react'
import PaymentDetailsModal from './PaymentDetailsModal';
import { buildUploadsUrl } from '../../utils/fileUrls';
import {
  DollarSign,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Download,
} from 'lucide-react'

// Fetch reviewed payments from backend
export const CompletedPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('updatedAt'); // reviewed time
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch('/api/payments/processed')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch reviewed payments');
        return res.json();
      })
      .then((data) => {
        setPayments(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getDate = (p) => new Date(p.updatedAt || p.createdAt || 0).getTime();

  // Filter and sort payments
  const filteredPayments = payments
    .filter(
      (payment) =>
        (payment.projectId && String(payment.projectId).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.clientId && String(payment.clientId).toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortField === 'updatedAt') {
        const ad = getDate(a)
        const bd = getDate(b)
        return sortDirection === 'asc' ? ad - bd : bd - ad
      }
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div className="p-8 text-center text-[#AAB396]">Loading reviewed payments...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  return (
    <div>
      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <DollarSign size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Reviewed Payments</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Project or Client ID..."
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

      {/* Payments Table */}
      <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#F7EED3]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase cursor-pointer" onClick={() => handleSort('projectId')}>Project ID <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase cursor-pointer" onClick={() => handleSort('clientId')}>Client ID <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase cursor-pointer" onClick={() => handleSort('amount')}>Amount <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase cursor-pointer" onClick={() => handleSort('method')}>Method <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase cursor-pointer" onClick={() => handleSort('type')}>Type <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase cursor-pointer" onClick={() => handleSort('updatedAt')}>Reviewed Time <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase cursor-pointer" onClick={() => handleSort('status')}>Status <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {paginatedPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-[#F7EED3]">
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{payment.projectId?.projectName || payment.projectName || payment.projectId || '-'}</td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{payment.clientId?.username || payment.clientName || payment.clientId?.email || payment.clientId || '-'}</td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">LKR {Number(payment.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{payment.method}</td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{payment.type}</td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs underline cursor-pointer">
                    {payment.receiptUrl ? (
                      <a href={buildUploadsUrl(payment.receiptUrl, 'payments')} target="_blank" rel="noopener noreferrer">View Receipt</a>
                    ) : (
                      <span className="text-[#AAB396]">No Receipt</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{payment.status || '-'}</td>
                  <td className="px-6 py-4 text-xs font-mono text-right text-[#674636] whitespace-pre-line break-words max-w-xs">
                    <button
                      onClick={() => handleView(payment)}
                      className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-xs font-mono font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white flex items-center mr-2"
                    >
                      <Eye size={16} className="inline mr-1" /> View
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-[#AAB396]">
                    No reviewed payments found
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} entries
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`p-2 rounded-md ${currentPage === 1 ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#FFF8E8]'}`}> 
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-md ${currentPage === page ? 'bg-[#674636] text-[#FFF8E8]' : 'text-[#674636] hover:bg-[#FFF8E8]'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`p-2 rounded-md ${currentPage === totalPages ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#FFF8E8]'}`}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showViewModal && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
}
