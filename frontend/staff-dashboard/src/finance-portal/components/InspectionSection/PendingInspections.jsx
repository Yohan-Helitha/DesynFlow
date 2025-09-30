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
  }



  const handleSort = (field) => {
    const normalizedField = field === 'id' ? '_id' : field;
    if (sortField === normalizedField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(normalizedField);
      setSortDirection('asc');
    }
  };

  const filteredInspections = pendingInspections
    .filter((inspection) => {
      const q = (searchTerm || '').toLowerCase();
      if (!q) return true;
      const fields = [
        inspection._id,
        inspection.id,
        inspection.client_name,
        inspection.clientName,
        inspection.email,
        inspection.phone_number,
        inspection.propertyLocation_address,
        inspection.propertyLocation_city,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      return fields.some((v) => v.includes(q));
    })
    .sort((a, b) => {
      let av;
      let bv;
      if (sortField === 'clientName') {
        av = (a.clientName || a.client_name || '').toLowerCase();
        bv = (b.clientName || b.client_name || '').toLowerCase();
      } else if (sortField === '_id') {
        av = String(a._id || '');
        bv = String(b._id || '');
      } else {
        av = (a[sortField] || '').toString().toLowerCase();
        bv = (b[sortField] || '').toString().toLowerCase();
      }
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
  const paginatedInspections = filteredInspections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  return (
    <div>
      {loading && (
        <div className="text-center text-[#AAB396] py-8">Loading pending inspections...</div>
      )}
      {error && (
        <div className="text-center text-[#674636] py-8 bg-[#F7EED3] border border-[#AAB396] rounded-md">{error}</div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <ClipboardCheck size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Pending Inspections</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search inspections..."
              className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-[#674636] text-[#674636] placeholder-[#AAB396]"
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
      {!loading && !error && (
        <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#AAB396]">
              <thead className="bg-[#F7EED3]">
                <tr>
                  {/* Only show Inspection ID and Client Name as sortable columns */}
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center capitalize">
                      Inspection ID
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Client ID</th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('clientName')}
                  >
                    <div className="flex items-center capitalize">
                      Client Name
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Site Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Property Type</th>
                  {/* Removed Floors column */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
                {paginatedInspections.map((inspection) => (
                  <tr key={inspection.id || inspection._id} className="hover:bg-[#F7EED3] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#674636] font-mono text-xs">{String(inspection._id || inspection.id || inspection.inspectionRequestId || '')}</td>
                    <td className="px-6 py-4 text-sm text-[#674636] font-mono text-xs">{String(inspection.client_ID || inspection.clientId || '-')}</td>
                    <td className="px-6 py-4 text-sm text-[#674636]">{inspection.clientName || inspection.client_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#674636]">{inspection.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#674636]">{inspection.phone_number || inspection.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#674636]">{[inspection.propertyLocation_address, inspection.propertyLocation_city].filter(Boolean).join(', ') || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#674636]">{inspection.propertyType || inspection.property_type || '-'}</td>
                    {/* Removed Floors column */}
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {inspection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleGenerate(inspection)}
                        className="text-[#674636] hover:text-[#FFF8E8] bg-[#F7EED3] hover:bg-[#674636] px-3 py-1 rounded-md transition-colors"
                      >
                        Generate
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedInspections.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-[#AAB396]">
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
        <div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
          <div className="text-sm text-[#674636]">
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
                  ? 'text-[#AAB396] cursor-not-allowed'
                  : 'text-[#674636] hover:bg-[#AAB396] hover:text-[#FFF8E8] transition-colors'
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
                currentPage === totalPages
                  ? 'text-[#AAB396] cursor-not-allowed'
                  : 'text-[#674636] hover:bg-[#AAB396] hover:text-[#FFF8E8] transition-colors'
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
