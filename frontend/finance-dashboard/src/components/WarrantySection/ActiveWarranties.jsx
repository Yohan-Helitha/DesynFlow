import React, { useState } from 'react';
import {
  Shield,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Bell,
} from 'lucide-react';
import { ViewWarrantyModal } from './ViewWarrantyModal';
import { AddWarrantyModal } from './AddWarrantyModal';

// Mock data for active warranties
const activeWarranties = [/* ...same as before... */];

export const ActiveWarranties = () => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('daysRemaining');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleView = (warranty) => {
    setSelectedWarranty(warranty);
    setShowViewModal(true);
  };

  const handleAddWarranty = () => {
    setShowAddModal(true);
  };

  const handleSendReminder = (warrantyId) => {
    console.log(`Sending reminder for warranty ${warrantyId}`);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter + Sort
  const filteredWarranties = activeWarranties
    .filter(
      (warranty) =>
        warranty.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredWarranties.length / itemsPerPage);
  const paginatedWarranties = filteredWarranties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-[#FFF8E8] p-6 rounded-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <Shield size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">
            Active Warranties
          </h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search warranties..."
              className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#F7EED3] placeholder-[#AAB396]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Filter size={16} className="text-[#AAB396]" />
            </button>
          </div>
          <button
            onClick={handleAddWarranty}
            className="bg-[#674636] text-[#FFF8E8] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#AAB396] flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Warranty
          </button>
        </div>
      </div>

      {/* Active Warranties Table */}
      <div className="bg-[#F7EED3] shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#FFF8E8]">
              <tr>
                {[
                  { key: 'id', label: 'Warranty ID' },
                  { key: 'projectName', label: 'Project' },
                  { key: 'clientName', label: 'Client' },
                  { key: 'type', label: 'Type' },
                  { key: 'startDate', label: 'Start Date' },
                  { key: 'endDate', label: 'End Date' },
                  { key: 'daysRemaining', label: 'Days Remaining' },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center">
                      {col.label}
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#F7EED3] divide-y divide-[#AAB396]">
              {paginatedWarranties.map((warranty) => (
                <tr key={warranty.id} className="hover:bg-[#FFF8E8]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#674636]">
                    {warranty.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    {warranty.projectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    {warranty.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    {warranty.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    {warranty.startDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    {warranty.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        warranty.daysRemaining <= 30
                          ? 'bg-red-200 text-red-900'
                          : warranty.daysRemaining <= 90
                          ? 'bg-yellow-200 text-yellow-900'
                          : 'bg-green-200 text-green-900'
                      }`}
                    >
                      {warranty.daysRemaining} days
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(warranty)}
                      className="text-[#674636] hover:text-[#AAB396] bg-[#FFF8E8] px-3 py-1 rounded-md mr-2"
                    >
                      <Eye size={16} className="inline mr-1" />
                      View
                    </button>
                    {warranty.daysRemaining <= 30 && (
                      <button
                        onClick={() => handleSendReminder(warranty.id)}
                        className="text-[#674636] hover:text-[#AAB396] bg-[#F7EED3] px-3 py-1 rounded-md"
                      >
                        <Bell size={16} className="inline mr-1" />
                        Remind
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedWarranties.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-[#AAB396]"
                  >
                    No active warranties found
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
              {Math.min(currentPage * itemsPerPage, filteredWarranties.length)}{' '}
              of {filteredWarranties.length} entries
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
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

      {/* View Warranty Modal */}
      {showViewModal && (
        <ViewWarrantyModal
          warranty={selectedWarranty}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Add Warranty Modal */}
      {showAddModal && <AddWarrantyModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};
