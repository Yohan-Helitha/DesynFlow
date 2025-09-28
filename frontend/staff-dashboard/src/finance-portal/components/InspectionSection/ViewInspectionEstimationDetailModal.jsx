import React from 'react';
import { X, ClipboardCheck, User, Calendar, DollarSign, MapPin, Building, Phone, Mail, Ruler } from 'lucide-react';

export const ViewInspectionEstimationDetailModal = ({ inspection, onClose }) => {
  if (!inspection) return null;

  const req = inspection.inspectionRequest || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396]">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
              <ClipboardCheck size={20} />
            </div>
            <h3 className="text-lg font-semibold text-[#674636]">Inspection Estimation Details</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <ClipboardCheck size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Inspection Request ID</span>
                  <p className="font-medium font-mono text-xs">{inspection.inspectionRequestId || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <User size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Client ID</span>
                  <p className="font-medium font-mono text-xs">{req.clientId || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Created Date</span>
                  <p className="font-medium">
                    {inspection.createdAt ? new Date(inspection.createdAt).toLocaleDateString() : 
                     (inspection.createdDate || inspection.date || 'N/A')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Estimated Cost</span>
                  <p className="font-medium text-lg">
                    ${inspection.estimatedCost ? inspection.estimatedCost.toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Ruler size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Distance</span>
                  <p className="font-medium">
                    {inspection.distanceKm || inspection.distance || 'N/A'} km
                  </p>
                </div>
              </div>

              {inspection.status && (
                <div className="flex items-center">
                  <span className="text-sm text-[#AAB396] mr-2">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    inspection.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    inspection.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    inspection.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-[#F7EED3] text-[#674636]'
                  }`}>
                    {inspection.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-[#F7EED3] p-4 rounded-lg">
            <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
              <User size={18} className="mr-2" />
              Client Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-[#AAB396]">Client Name</span>
                  <p className="font-medium">{req.clientName || 'N/A'}</p>
                </div>
                
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Email</span>
                    <p className="font-medium">{req.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Phone</span>
                    <p className="font-medium">{req.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
            <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
              <Building size={18} className="mr-2" />
              Property Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin size={16} className="mr-2 mt-1 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Site Location</span>
                    <p className="font-medium">{req.siteLocation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Building size={16} className="mr-2 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Property Type</span>
                    <p className="font-medium">{req.propertyType || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown if available */}
          {(inspection.laborCost || inspection.materialCost || inspection.serviceCost) && (
            <div className="bg-[#F7EED3] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
                <DollarSign size={18} className="mr-2" />
                Cost Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {inspection.laborCost && (
                  <div className="flex justify-between">
                    <span className="text-[#AAB396]">Labor Cost:</span>
                    <span className="font-medium">${inspection.laborCost.toLocaleString()}</span>
                  </div>
                )}
                {inspection.materialCost && (
                  <div className="flex justify-between">
                    <span className="text-[#AAB396]">Material Cost:</span>
                    <span className="font-medium">${inspection.materialCost.toLocaleString()}</span>
                  </div>
                )}
                {inspection.serviceCost && (
                  <div className="flex justify-between">
                    <span className="text-[#AAB396]">Service Cost:</span>
                    <span className="font-medium">${inspection.serviceCost.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {(inspection.notes || inspection.description || req.description) && (
            <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-2">Additional Notes</h4>
              <p className="text-[#674636] text-sm leading-relaxed">
                {inspection.notes || inspection.description || req.description || 'No additional notes available.'}
              </p>
            </div>
          )}

          {/* Technical Details if available */}
          {(inspection.inspectionType || inspection.priority || inspection.assignedTo) && (
            <div className="bg-[#F7EED3] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-3">Inspection Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {inspection.inspectionType && (
                  <div>
                    <span className="text-sm text-[#AAB396]">Type</span>
                    <p className="font-medium">{inspection.inspectionType}</p>
                  </div>
                )}
                {inspection.priority && (
                  <div>
                    <span className="text-sm text-[#AAB396]">Priority</span>
                    <p className="font-medium">{inspection.priority}</p>
                  </div>
                )}
                {inspection.assignedTo && (
                  <div>
                    <span className="text-sm text-[#AAB396]">Assigned To</span>
                    <p className="font-medium">{inspection.assignedTo}</p>
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