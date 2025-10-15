import React from 'react';
import { X, FileText, User, Calendar, DollarSign, MapPin, Building } from 'lucide-react';

export const ViewInspectionEstimationModal = ({ estimation, onClose }) => {
  if (!estimation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396]">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-semibold text-[#674636]">Estimation Details</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#AAB396] hover:text-[#674636] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-[#674636]">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">

              <div className="flex items-center">
                <FileText size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Project</span>
                  <p className="font-medium">
                    {typeof estimation.projectId === 'object' && estimation.projectId?.projectName
                      ? estimation.projectId.projectName
                      : estimation.projectId || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-sm text-[#AAB396] mr-2">Version</span>
                <span className="px-2 py-1 bg-[#F7EED3] rounded-md text-sm font-medium">
                  v{estimation.version || 'N/A'}
                </span>
              </div>

              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Created Date</span>
                  <p className="font-medium">
                    {estimation.createdAt ? new Date(estimation.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <User size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Status</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                    estimation.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    estimation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    estimation.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-[#F7EED3] text-[#674636]'
                  }`}>
                    {estimation.status || 'Unknown'}
                  </span>
                </div>
              </div>

              {estimation.updatedAt && (
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Last Updated</span>
                    <p className="font-medium">
                      {new Date(estimation.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-[#F7EED3] p-4 rounded-lg">
            <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
              <DollarSign size={18} className="mr-2" />
              Cost Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="text-[#AAB396]">Labor Cost:</span>
                <span className="font-medium">LKR {estimation.laborCost?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAB396]">Material Cost:</span>
                <span className="font-medium">LKR {estimation.materialCost?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAB396]">Service Cost:</span>
                <span className="font-medium">LKR {estimation.serviceCost?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAB396]">Contingency Cost:</span>
                <span className="font-medium">LKR {estimation.contingencyCost?.toLocaleString() || '0'}</span>
              </div>
            </div>
            <div className="border-t border-[#AAB396] mt-3 pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Cost:</span>
                <span className="text-[#674636]">LKR {estimation.total?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {(estimation.notes || estimation.description) && (
            <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-2">Additional Notes</h4>
              <p className="text-[#674636] text-sm leading-relaxed">
                {estimation.notes || estimation.description || 'No additional notes available.'}
              </p>
            </div>
          )}

          {/* Project Details if available */}
          {(estimation.project || estimation.location || estimation.propertyType) && (
            <div className="bg-[#F7EED3] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
                <Building size={18} className="mr-2" />
                Project Information
              </h4>
              <div className="space-y-2">
                {estimation.location && (
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2 text-[#AAB396]" />
                    <span className="text-sm">
                      <span className="text-[#AAB396]">Location:</span> {estimation.location}
                    </span>
                  </div>
                )}
                {estimation.propertyType && (
                  <div className="flex items-center">
                    <Building size={16} className="mr-2 text-[#AAB396]" />
                    <span className="text-sm">
                      <span className="text-[#AAB396]">Property Type:</span> {estimation.propertyType}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-[#AAB396] bg-[#F7EED3]">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#674636] text-[#FFF8E8] rounded-md text-sm font-medium hover:bg-[#AAB396] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};