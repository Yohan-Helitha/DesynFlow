import React, { useState, useEffect } from 'react'
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
  const [sortField, setSortField] = useState('verifiedTime');
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

  // Filter and sort payments
  const filteredPayments = payments
    .filter(
      (payment) =>
        (payment.projectId && payment.projectId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.clientId && payment.clientId.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
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
    return <div className="p-8 text-center text-gray-500">Loading reviewed payments...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  return (
    <div>
      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
            <DollarSign size={20} />
          </div>
          <h2 className="text-xl font-semibold">Reviewed Payments</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Project or Client ID..."
              className="pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Filter size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('projectId')}>Project ID <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('clientId')}>Client ID <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('amount')}>Amount <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('method')}>Method <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('type')}>Type <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('verifiedTime')}>Verified Time <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('status')}>Status <ArrowUpDown size={14} className="inline ml-1" /></th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.projectId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.clientId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 underline cursor-pointer">
                    {payment.receiptUrl ? (
                      <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">View Receipt</a>
                    ) : (
                      <span className="text-gray-400">No Receipt</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.status || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleView(payment)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md mr-2">
                      <Eye size={16} className="inline mr-1" /> View
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No reviewed payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} entries
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}> 
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-md ${currentPage === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showViewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
            <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
            {selectedPayment && (
              <div className="space-y-2">
                <div><span className="font-medium">Project ID:</span> {selectedPayment.projectId}</div>
                <div><span className="font-medium">Client ID:</span> {selectedPayment.clientId}</div>
                <div><span className="font-medium">Amount:</span> ${selectedPayment.amount.toLocaleString()}</div>
                <div><span className="font-medium">Method:</span> {selectedPayment.method}</div>
                <div><span className="font-medium">Type:</span> {selectedPayment.type}</div>
                <div><span className="font-medium">Verified Time:</span> {selectedPayment.verifiedTime}</div>
                <div><span className="font-medium">Receipt:</span> {selectedPayment.receiptUrl ? (<a href={selectedPayment.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">View Receipt</a>) : (<span className="text-gray-400">No Receipt</span>)}</div>
                {selectedPayment.comment && (
                  <div><span className="font-medium">Comment:</span> {selectedPayment.comment}</div>
                )}
              </div>
            )}
            <button onClick={() => setShowViewModal(false)} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
