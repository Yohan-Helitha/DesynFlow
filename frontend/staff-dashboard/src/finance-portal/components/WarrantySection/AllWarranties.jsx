import React, { useState, useEffect } from 'react';
import {
  Shield,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Bell,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { ViewWarrantyModal } from './ViewWarrantyModal';
import { AddWarrantyModal } from './AddWarrantyModal';

export const AllWarranties = () => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [allWarranties, setAllWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch warranties from backend
  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/warranties/all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllWarranties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching warranties:', err);
      setError('Failed to load warranties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (warranty) => {
    setSelectedWarranty(warranty);
    setShowViewModal(true);
  };

  const handleAddWarranty = () => {
    setShowAddModal(true);
  };

  const handleSendReminder = (warrantyId) => {
    console.log(`Sending reminder for warranty ${warrantyId}`);
    // TODO: Implement reminder functionality
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter by status and search term, then sort
  const filteredWarranties = allWarranties
    .filter((warranty) => {
      // Derive normalized status with date fallback
      const rawStatus = (warranty.status || '').toString().toLowerCase().trim();
      let derivedStatus = rawStatus;
      // Use dates if status missing or not one of expected
      const validStatuses = ['active', 'expired', 'claimed', 'replaced'];
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      if (!validStatuses.includes(derivedStatus)) {
        if (warranty.endDate) {
          const end = new Date(warranty.endDate);
          derivedStatus = end < todayMidnight ? 'expired' : 'active';
        }
      } else if (derivedStatus === 'active' || derivedStatus === 'expired') {
        // Re-confirm using end date if provided to prevent stale status
        if (warranty.endDate) {
          const end = new Date(warranty.endDate);
            if (end < todayMidnight) derivedStatus = 'expired';
        }
      }

      const statusMatch = showActiveOnly ? derivedStatus === 'active' : derivedStatus === 'expired';

      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      if (!searchLower) return statusMatch;
      const searchable = [
        warranty._id,
        warranty.projectName,
        warranty.clientName,
        warranty.clientEmail,
        warranty.clientId,
        warranty.itemId,
        warranty.materialName,
      ]
        .filter(Boolean)
        .map((v) => v.toString().toLowerCase());
      const searchMatch = searchable.some((field) => field.includes(searchLower));
      return statusMatch && searchMatch;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special sorting for dates
      if (sortField === 'startDate' || sortField === 'endDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      // Handle undefined numeric fields (daysRemaining/daysExpired)
      if (aValue === undefined || aValue === null) aValue = -Infinity;
      if (bValue === undefined || bValue === null) bValue = -Infinity;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredWarranties.length / itemsPerPage);
  const paginatedWarranties = filteredWarranties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when switching between active/expired
  useEffect(() => {
    setCurrentPage(1);
  }, [showActiveOnly]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#F7EED3] p-4 rounded-md shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-[#674636]">
            <Loader2 size={24} className="animate-spin" />
            <span>Loading warranties...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#F7EED3] p-4 rounded-md shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-[#674636] mb-2">⚠️ Error</div>
            <div className="text-[#674636] mb-4">{error}</div>
            <button
              onClick={fetchWarranties}
              className="bg-[#674636] text-[#FFF8E8] px-4 py-2 rounded-md hover:bg-[#AAB396]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7EED3] p-4 rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <Shield size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">
            All Warranties
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Active/Expired Toggle */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${!showActiveOnly ? 'text-[#AAB396]' : 'text-[#674636]'}`}>
              Active
            </span>
            <button
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className="focus:outline-none"
            >
              {showActiveOnly ? (
                <ToggleRight size={24} className="text-[#674636]" />
              ) : (
                <ToggleLeft size={24} className="text-[#AAB396]" />
              )}
            </button>
            <span className={`text-sm font-medium ${showActiveOnly ? 'text-[#AAB396]' : 'text-[#674636]'}`}>
              Expired
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search warranties..."
              className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#F7EED3] placeholder-[#AAB396] text-[#674636]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Filter size={16} className="text-[#AAB396]" />
            </button>
          </div>

          {/* Add Warranty Button - only show for active warranties */}
          {showActiveOnly && (
            <button
              onClick={handleAddWarranty}
              className="bg-[#674636] text-[#FFF8E8] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#AAB396] flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add Warranty
            </button>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="mb-3">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FFF8E8] text-[#674636] border border-[#AAB396]">
          <span className={`w-2 h-2 rounded-full mr-2 ${showActiveOnly ? 'bg-[#AAB396]' : 'bg-[#674636]'}`}></span>
          Showing {showActiveOnly ? 'Active' : 'Expired'} Warranties ({filteredWarranties.length})
        </div>
      </div>

      {/* Warranties Table */}
      <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#F7EED3]">
              <tr>
                {[
                  { key: '_id', label: 'Warranty ID' },
                  { key: 'projectName', label: 'Project' },
                  { key: 'clientName', label: 'Client' },
                  { key: 'materialType', label: 'Type' },
                  { key: 'itemId', label: 'Item ID' },
                  { key: 'startDate', label: 'Start Date' },
                  { key: 'endDate', label: showActiveOnly ? 'End Date' : 'Expiry Date' },
                  { 
                    key: showActiveOnly ? 'daysRemaining' : 'daysExpired', 
                    label: showActiveOnly ? 'Days Remaining' : 'Days Expired' 
                  },
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
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {paginatedWarranties.map((warranty) => (
                <tr key={warranty._id} className="hover:bg-[#F7EED3]">
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
                    {warranty._id}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
                    {warranty.projectName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
                    {warranty.clientName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
                    {warranty.materialType || warranty.materialCategory || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
                    {warranty.itemId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
                    {warranty.startDate || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
                    {warranty.endDate || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {showActiveOnly ? (
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          warranty.daysRemaining <= 30
                            ? 'bg-[#674636] text-[#FFF8E8] border border-[#674636]'
                            : warranty.daysRemaining <= 90
                            ? 'bg-[#F7EED3] text-[#AAB396] border border-[#AAB396]'
                            : 'bg-[#AAB396] text-[#FFF8E8] border border-[#674636]'
                        }`}
                      >
                        {warranty.daysRemaining || 0} days
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#674636] text-[#FFF8E8]">
                        {warranty.daysExpired || 0} days
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-right text-[#674636] whitespace-pre-line break-words max-w-xs font-medium">
                    <button
                      onClick={() => handleView(warranty)}
                      className="text-[#674636] hover:text-[#AAB396] bg-[#FFF8E8] px-3 py-1 rounded-md mr-2 border border-[#AAB396] text-xs font-mono"
                    >
                      <Eye size={16} className="inline mr-1" />
                      View
                    </button>
                    {showActiveOnly ? (
                      // Actions for active warranties
                      warranty.daysRemaining <= 30 && (
                        <button
                          onClick={() => handleSendReminder(warranty._id)}
                          className="text-[#674636] hover:text-[#AAB396] bg-[#F7EED3] px-3 py-1 rounded-md border border-[#AAB396] text-xs font-mono"
                        >
                          <Bell size={16} className="inline mr-1" />
                          Remind
                        </button>
                      )
                    ) : (
                      // No actions for expired warranties (Renew removed)
                      null
                    )}
                  </td>
                </tr>
              ))}
              {paginatedWarranties.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-[#AAB396]"
                  >
                    No {showActiveOnly ? 'active' : 'expired'} warranties found
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
          onClose={() => {
            setShowViewModal(false);
            fetchWarranties(); // Refresh data when modal closes
          }}
        />
      )}

      {/* Add Warranty Modal */}
      {showAddModal && (
        <AddWarrantyModal
          onClose={() => {
            setShowAddModal(false);
            fetchWarranties(); // Refresh data when modal closes
          }}
        />
      )}
    </div>
  );
};