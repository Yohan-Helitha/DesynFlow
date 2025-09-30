import React, { useState } from 'react'
import {
  ShoppingCart,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from 'lucide-react'
import PurchaseOrderDetailsModal from './PurchaseOrderDetailsModal'

import { useEffect } from 'react';

export const PendingPurchaseOrders = () => {
  const [pendingPurchaseOrders, setPendingPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchApprovals = () => {
    setLoading(true);
    // Fetch purchase orders
    fetch('/api/purchase-orders?status=PendingFinanceApproval')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch pending purchase orders');
        return res.json();
      })
      .then((pos) => {
        const list = Array.isArray(pos) ? pos : [];
        setPendingPurchaseOrders(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[#AAB396]">Loading pending purchase orders...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const handleView = (po) => {
    setSelectedId(po._id)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort purchase orders
  const filteredPOs = pendingPurchaseOrders
    .filter(
      (po) =>
        (po._id && po._id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (po.projectId && po.projectId.toString().toLowerCase().includes(searchTerm.toLowerCase()))
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
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);
  const paginatedPOs = filteredPOs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <ShoppingCart size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Pending Purchase Orders</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search purchase orders..."
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

      {/* Pending Purchase Orders Table */}
      <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#F7EED3]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">PO ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {paginatedPOs.map((po) => (
                <tr key={po._id} className="hover:bg-[#F7EED3]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#674636]">{po._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#674636]">${(Number(po.totalAmount)||0).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(po)}
                      className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedPOs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-[#AAB396]">
                    No purchase orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPOs.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
            <div className="text-sm text-[#674636]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredPOs.length)} of{' '}
              {filteredPOs.length} entries
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

      {/* View Purchase Order Modal */}
      {selectedId && (
        <PurchaseOrderDetailsModal
          purchaseOrderId={selectedId}
          onClose={() => setSelectedId(null)}
          onAction={() => { setSelectedId(null); fetchApprovals(); }}
        />
      )}
    </div>
  )
}
