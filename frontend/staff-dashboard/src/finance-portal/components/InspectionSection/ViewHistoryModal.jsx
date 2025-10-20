import React, { useState } from 'react';
import { ClipboardCheck, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewInspectionEstimationDetailModal } from './ViewInspectionEstimationDetailModal';

export const ViewHistoryModal = ({ historyData }) => {
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleViewInspection = (inspection) => {
    setSelectedInspection(inspection);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInspection(null);
  };

  // Filter and paginate data (null-safe string coercion)
  // Ensure newest-first ordering
  const sortedHistory = (Array.isArray(historyData) ? historyData.slice() : []).sort((a, b) => {
    const at = new Date(a.createdAt || a.createdDate || 0).getTime();
    const bt = new Date(b.createdAt || b.createdDate || 0).getTime();
    return bt - at;
  });

  const filteredData = (sortedHistory || []).filter((item) => {
    const q = (searchTerm || '').toLowerCase();
    const req = item?.inspectionRequest || {};
    const reqIdText = String(item?.inspectionRequestId ?? '').toLowerCase();
    const clientName = String(req?.client_name ?? '').toLowerCase();
    const email = String(req?.email ?? '').toLowerCase();
    const site = [req?.propertyLocation_address, req?.propertyLocation_city].filter(Boolean).join(' ').toLowerCase();
    return (
      (reqIdText && reqIdText.includes(q)) ||
      (clientName && clientName.includes(q)) ||
      (email && email.includes(q)) ||
      (site && site.includes(q))
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pageSlice = filteredData.slice(startIdx, startIdx + itemsPerPage);

  return (
    <>
      {/* Header to match Pending Inspections */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <ClipboardCheck size={18} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Inspection Estimation History</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search history..."
            className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#F7EED3] placeholder-[#AAB396] text-[#674636]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Filter size={16} className="text-[#AAB396]" />
          </button>
        </div>
      </div>
      {/* Table container to match Pending Inspections */}
      <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#F7EED3]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Site Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Distance (km)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Estimated Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Created Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {pageSlice.map((item, index) => {
                const req = item?.inspectionRequest || {};
                return (
                  <tr key={index} className="hover:bg-[#F7EED3] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[#674636] max-w-xs">{req?.client_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[#674636] max-w-xs">{[req?.propertyLocation_address, req?.propertyLocation_city].filter(Boolean).join(', ') || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[#674636] max-w-xs">{item?.distanceKm ?? item?.distance ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[#674636] font-semibold max-w-xs">{typeof item?.estimatedCost === 'number' ? `LKR ${item.estimatedCost.toLocaleString()}` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[#674636] max-w-xs">{item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : (req?.createdAt ? new Date(req.createdAt).toLocaleDateString() : (item?.createdDate || item?.date || '-'))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-mono font-medium">
                      <button
                        onClick={() => setShowModal(true) || setSelectedInspection(item)}
                        className="text-[#674636] hover:text-[#FFF8E8] bg-[#F7EED3] hover:bg-[#674636] px-3 py-1 rounded-md transition-colors flex items-center justify-center"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pageSlice.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#AAB396]">
                    No inspection estimation history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
            <div className="text-sm text-[#674636]">
              Showing {startIdx + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#FFF8E8]'}`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md ${currentPage === page ? 'bg-[#674636] text-[#FFF8E8]' : 'text-[#674636] hover:bg-[#FFF8E8]'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#FFF8E8]'}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ViewInspectionEstimationDetailModal 
          inspection={selectedInspection} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
};
