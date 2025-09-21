import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { GenerateEstimateModal } from './GenerateEstimateModal';

export const PendingInspections = () => {
  // State for estimate history
  const [estimateHistory, setEstimateHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorHistory, setErrorHistory] = useState(null);

  // Fetch estimate history on mount
  useEffect(() => {
    setLoadingHistory(true);
    fetch('/api/inspection-estimation/all-estimation-details')
      .then((res) => res.json())
      .then((data) => {
        setEstimateHistory(Array.isArray(data) ? data : []);
        setLoadingHistory(false);
      })
      .catch((err) => {
        setErrorHistory('Failed to load estimate history');
        setLoadingHistory(false);
      });
  }, []);
  const [pendingInspections, setPendingInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('requestedDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Fetch pending inspections (can be called on demand)
  const fetchPendingInspections = () => {
    setLoading(true);
    fetch('/api/inspection-estimation/pending')
      .then((res) => res.json())
      .then((data) => {
        setPendingInspections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load pending inspections');
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchPendingInspections();
  }, []);

  // Fetch estimate history (can be called on demand)
  const fetchEstimateHistory = () => {
    setLoadingHistory(true);
    fetch('/api/inspection-estimation/all-estimation-details')
      .then((res) => res.json())
      .then((data) => {
        setEstimateHistory(Array.isArray(data) ? data : []);
        setLoadingHistory(false);
      })
      .catch((err) => {
        setErrorHistory('Failed to load estimate history');
        setLoadingHistory(false);
      });
  };
  // Generic callback to refresh all data after modal actions
  const handleDataChanged = () => {
    fetchPendingInspections();
    fetchEstimateHistory();
  };

  const handleGenerate = (inspection) => {
    setSelectedInspection(inspection);
    setShowGenerateModal(true);
  };



  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredInspections = pendingInspections
    .filter(
      (inspection) =>
        (inspection.id || inspection._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inspection.clientName || inspection.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inspection.siteLocation || inspection.site_location || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if ((a[sortField] || '') < (b[sortField] || '')) return sortDirection === 'asc' ? -1 : 1;
      if ((a[sortField] || '') > (b[sortField] || '')) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
  const paginatedInspections = filteredInspections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  return (
    <div>
      {loading && (
        <div className="text-center text-gray-500 py-8">Loading pending inspections...</div>
      )}
      {error && (
        <div className="text-center text-red-500 py-8">{error}</div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
            <ClipboardCheck size={20} />
          </div>
          <h2 className="text-xl font-semibold">Pending Inspections</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search inspections..."
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

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Only show Inspection ID and Client Name as sortable columns */}
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center capitalize">
                      Inspection ID
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client ID</th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('clientName')}
                  >
                    <div className="flex items-center capitalize">
                      Client Name
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property Type</th>
                  {/* Removed Floors column */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInspections.map((inspection) => (
                  <tr key={inspection.id || inspection._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{inspection.inspectionRequestId || inspection.id || inspection._id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inspection.clientId || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inspection.clientName || inspection.client_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inspection.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inspection.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inspection.siteLocation || inspection.site_location}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inspection.propertyType || inspection.property_type}</td>
                    {/* Removed Floors column */}
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {inspection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleGenerate(inspection)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md mr-2"
                      >
                        Generate
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedInspections.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                      No inspections found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredInspections.length > 0 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredInspections.length)} of{' '}
            {filteredInspections.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
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
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}


      {/* Modals */}
      {showGenerateModal && (
        <GenerateEstimateModal
          inspection={selectedInspection}
          onClose={() => setShowGenerateModal(false)}
          onDataChanged={handleDataChanged}
        />
      )}
    </div>
  );
};
