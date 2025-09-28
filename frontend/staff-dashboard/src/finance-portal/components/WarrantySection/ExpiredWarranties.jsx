import React, { useState } from 'react';
import {
  Shield,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { ViewWarrantyModal } from './ViewWarrantyModal';

const expiredWarranties = [/* ... same mock data ... */];

export const ExpiredWarranties = () => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('daysExpired');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleView = (warranty) => {
    setSelectedWarranty(warranty);
    setShowViewModal(true);
  };

  const handleRenewWarranty = (warrantyId) => {
    console.log(`Renewing warranty ${warrantyId}`);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredWarranties = expiredWarranties
    .filter(
      (w) =>
        w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredWarranties.length / itemsPerPage);
  const paginatedWarranties = filteredWarranties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-[#FFF8E8] p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <Shield size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">
            Expired Warranties
          </h2>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search warranties..."
            className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#F7EED3] placeholder-[#AAB396]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#AAB396]">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#F7EED3] shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#FFF8E8]">
              <tr>
                {[
                  { label: 'Warranty ID', field: 'id' },
                  { label: 'Project', field: 'projectName' },
                  { label: 'Client', field: 'clientName' },
                  { label: 'Type', field: 'type' },
                  { label: 'Expiry Date', field: 'endDate' },
                  { label: 'Days Expired', field: 'daysExpired' },
                ].map(({ label, field }) => (
                  <th
                    key={field}
                    className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort(field)}
                  >
                    <div className="flex items-center">
                      {label}
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#AAB396]">
              {paginatedWarranties.map((w) => (
                <tr key={w.id} className="hover:bg-[#FFF8E8]">
                  <td className="px-6 py-4 text-sm font-medium text-[#674636]">
                    {w.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#674636]">
                    {w.projectName}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#674636]">
                    {w.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#674636]">
                    {w.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#674636]">
                    {w.endDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#674636] text-[#FFF8E8]">
                      {w.daysExpired} days
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(w)}
                      className="text-[#674636] hover:bg-[#FFF8E8] border border-[#AAB396] px-3 py-1 rounded-md"
                    >
                      <Eye size={16} className="inline mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedWarranties.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-[#AAB396]">
                    No expired warranties found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredWarranties.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#FFF8E8]">
            <div className="text-sm text-[#674636]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredWarranties.length)} of{' '}
              {filteredWarranties.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? 'text-[#AAB396] cursor-not-allowed'
                    : 'text-[#674636] hover:bg-[#F7EED3]'
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
                      : 'text-[#674636] hover:bg-[#F7EED3]'
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
                    : 'text-[#674636] hover:bg-[#F7EED3]'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showViewModal && (
        <ViewWarrantyModal
          warranty={selectedWarranty}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
};
