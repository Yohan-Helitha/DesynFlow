import React, { useState } from 'react';
import { ClipboardCheck, Eye } from 'lucide-react';
import { ViewInspectionEstimationDetailModal } from './ViewInspectionEstimationDetailModal';

export const ViewHistoryModal = ({ historyData }) => {
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewInspection = (inspection) => {
    setSelectedInspection(inspection);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInspection(null);
  };

  return (
    <>
      <div className="bg-[#FFF8E8] shadow-sm rounded-md p-6 mb-6 border border-[#AAB396]">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-[#674636]">
          <span className="w-8 h-8 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <ClipboardCheck size={20} />
          </span>
          Inspection Estimation History
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#F7EED3]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Inspection Request ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Client ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Client Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Site Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Property Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Distance (km)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Estimated Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Created Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {historyData.map((item, index) => {
                const req = item.inspectionRequest || {};
                return (
                  <tr key={index} className="hover:bg-[#F7EED3] transition-colors">
                    <td className="px-4 py-4 text-sm text-[#674636] font-mono text-xs">{item.inspectionRequestId || '-'}</td>
                    <td className="px-4 py-4 text-sm text-[#674636] font-mono text-xs">{req.clientId || '-'}</td>
                    <td className="px-4 py-4 text-sm text-[#674636]">{req.clientName || '-'}</td>
                    <td className="px-4 py-4 text-sm text-[#674636]">{req.email || '-'}</td>
                    <td className="px-4 py-4 text-sm text-[#674636]">{req.phone || '-'}</td>
                    <td className="px-4 py-4 text-sm text-[#674636]">{req.siteLocation || '-'}</td>
                    <td className="px-4 py-4 text-sm text-[#674636]">{req.propertyType || '-'}</td>
                    <td className="px-4 py-4 text-sm text-[#674636]">{item.distanceKm || item.distance || '-'}</td>
                    <td className="px-4 py-4 text-sm text-[#674636] font-semibold">
                      {item.estimatedCost ? `$${item.estimatedCost.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#674636]">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : (item.createdDate || item.date || '-')}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <button 
                        onClick={() => handleViewInspection(item)}
                        className="px-3 py-1 bg-[#674636] text-[#FFF8E8] rounded text-sm font-medium hover:bg-[#AAB396] transition-colors flex items-center"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {historyData.length === 0 && (
            <div className="text-center py-8 text-[#AAB396]">
              <ClipboardCheck size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No inspection estimation history available</p>
              <p className="text-sm mt-2">Inspection estimations will appear here once created.</p>
            </div>
          )}
        </div>
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
