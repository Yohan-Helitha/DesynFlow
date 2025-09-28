import React from 'react';

export const EstimationDetailsModal = ({ estimation, onClose }) => {
  if (!estimation) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396]">
          <h3 className="text-lg font-medium text-[#674636]">Estimation Details</h3>
          <button onClick={onClose} className="text-[#AAB396] hover:text-[#674636]">
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>&times;</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-[#674636]">
          <div>
            <span className="font-medium">Project ID:</span> {estimation.projectId}
          </div>
          <div>
            <span className="font-medium">Version:</span> {estimation.version}
          </div>
          <div>
            <span className="font-medium">Cost Breakdown:</span>
            <ul className="ml-4 mt-1 space-y-1">
              <li>Labor Cost: ${estimation.laborCost?.toLocaleString() ?? '-'}</li>
              <li>Material Cost: ${estimation.materialCost?.toLocaleString() ?? '-'}</li>
              <li>Service Cost: ${estimation.serviceCost?.toLocaleString() ?? '-'}</li>
              <li>Contingency Cost: ${estimation.contingencyCost?.toLocaleString() ?? '-'}</li>
            </ul>
          </div>
          <div>
            <span className="font-medium">Total Cost:</span> ${estimation.total?.toLocaleString() ?? '-'}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-[#AAB396]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-[#FFF8E8]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
