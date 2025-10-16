import React from 'react';
import { X, FileText, User, Calendar, AlertCircle, CheckCircle, XCircle, Clock, Package, Truck } from 'lucide-react';

export const ViewWarrantyClaimModal = ({ claim, onClose }) => {
  if (!claim) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted': return <FileText size={16} className="text-[#674636]" />;
      case 'UnderReview': return <Clock size={16} className="text-[#AAB396]" />;
      case 'Approved': return <CheckCircle size={16} className="text-[#AAB396]" />;
      case 'Rejected': return <XCircle size={16} className="text-[#674636]" />;
      case 'Replaced': return <Package size={16} className="text-[#674636]" />;
      default: return <AlertCircle size={16} className="text-[#AAB396]" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-[#F7EED3] text-[#674636] border border-[#AAB396]';
      case 'UnderReview': return 'bg-[#FFF8E8] text-[#AAB396] border border-[#AAB396]';
      case 'Approved': return 'bg-[#AAB396] text-[#FFF8E8] border border-[#674636]';
      case 'Rejected': return 'bg-[#674636] text-[#FFF8E8] border border-[#674636]';
      case 'Replaced': return 'bg-[#F7EED3] text-[#AAB396] border border-[#674636]';
      default: return 'bg-[#F7EED3] text-[#674636] border border-[#AAB396]';
    }
  };

  // Extract warranty and client info from claim
  const warranty = typeof claim.warrantyId === 'object' ? claim.warrantyId : null;
  const client = typeof claim.clientId === 'object' ? claim.clientId : null;
  const reviewer = typeof claim.financeReviewerId === 'object' ? claim.financeReviewerId : null;

  // Helper to get client name
  const getClientName = () => {
    if (client) {
      return client.username || client.name || client.email || 'Unknown Client';
    }
    return 'Unknown Client';
  };

  // Helper to get client email
  const getClientEmail = () => {
    if (client) {
      return client.email || 'No email provided';
    }
    return 'No email provided';
  };

  // Helper to get project name
  const getProjectName = () => {
    if (warranty) {
      if (warranty.projectName) return warranty.projectName;
      if (typeof warranty.projectId === 'object' && warranty.projectId?.projectName) {
        return warranty.projectId.projectName;
      }
    }
    return 'Unknown Project';
  };

  // Helper to get material name
  const getMaterialName = () => {
    if (warranty) {
      if (warranty.materialName) return warranty.materialName;
      if (typeof warranty.itemId === 'object' && warranty.itemId?.materialName) {
        return warranty.itemId.materialName;
      }
    }
    return 'Unknown Material';
  };

  // Helper to get material type/category
  const getMaterialType = () => {
    if (warranty) {
      if (warranty.materialType) return warranty.materialType;
      if (warranty.type) return warranty.type;
      if (typeof warranty.itemId === 'object') {
        if (warranty.itemId?.type) return warranty.itemId.type;
        if (warranty.itemId?.category) return warranty.itemId.category;
      }
    }
    return 'Unknown Type';
  };

  // Helper to format dates
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not specified';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396]">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
              {getStatusIcon(claim.status)}
            </div>
            <h3 className="text-lg font-semibold text-[#674636]">Warranty Claim Details</h3>
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
          {/* Basic Claim Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <FileText size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Claim ID</span>
                  <p className="font-medium font-mono text-xs">{claim._id || 'Not available'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FileText size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Warranty ID</span>
                  <p className="font-medium font-mono text-xs">{warranty?._id || (typeof claim.warrantyId === 'string' ? claim.warrantyId : 'Not linked')}</p>
                </div>
              </div>

              <div className="flex items-center">
                <User size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Client Name</span>
                  <p className="font-medium">{getClientName()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-sm text-[#AAB396] mr-2">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(claim.status)}`}>
                  {getStatusIcon(claim.status)}
                  <span className="ml-1">{claim.status || 'Unknown'}</span>
                </span>
              </div>

              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Submitted Date</span>
                  <p className="font-medium">
                    {formatDate(claim.createdAt)}
                  </p>
                </div>
              </div>

              {claim.updatedAt && claim.updatedAt !== claim.createdAt && (
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Last Updated</span>
                    <p className="font-medium">
                      {formatDate(claim.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Issue Description */}
          <div className="bg-[#F7EED3] p-4 rounded-lg">
            <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
              <AlertCircle size={18} className="mr-2" />
              Issue Description
            </h4>
            <p className="text-[#674636] leading-relaxed">
              {claim.issueDescription || 'No description provided.'}
            </p>
          </div>

          {/* Warranty Information */}
          {warranty && (
            <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-3">Related Warranty Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-[#AAB396]">Project Name</span>
                    <p className="font-medium">{getProjectName()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Material Name</span>
                    <p className="font-medium">{getMaterialName()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-[#AAB396]">Material Type</span>
                    <p className="font-medium">{getMaterialType()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Warranty Status</span>
                    <p className="font-medium">{warranty.status || 'Unknown'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-[#AAB396]">Warranty Start</span>
                    <p className="font-medium">{formatDate(warranty.startDate || warranty.warrantyStart)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Warranty End</span>
                    <p className="font-medium">{formatDate(warranty.endDate || warranty.warrantyEnd)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Client Information */}
          {client && (
            <div className="bg-[#F7EED3] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
                <User size={18} className="mr-2" />
                Client Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-[#AAB396]">Client Name</span>
                    <p className="font-medium">{getClientName()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Email</span>
                    <p className="font-medium">{getClientEmail()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-[#AAB396]">Phone</span>
                    <p className="font-medium">{client.phone || client.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Address</span>
                    <p className="font-medium">{client.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Information removed per request */}

          {/* Warehouse Action Information */}
          {claim.warehouseAction && (
            <div className="bg-[#F7EED3] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
                <Truck size={18} className="mr-2" />
                Shipping Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-[#AAB396]">Replacement Shipped</span>
                  <p className="font-medium">
                    {claim.warehouseAction.shippedReplacement ? (
                      <span className="text-[#AAB396] font-semibold">Yes</span>
                    ) : (
                      <span className="text-[#674636] font-semibold">No</span>
                    )}
                  </p>
                </div>
                {claim.warehouseAction.shippedAt && (
                  <div>
                    <span className="text-sm text-[#AAB396]">Shipped Date</span>
                    <p className="font-medium">
                      {new Date(claim.warehouseAction.shippedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {(claim.notes || claim.additionalDetails) && (
            <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-2">Additional Notes</h4>
              <p className="text-[#674636] text-sm leading-relaxed">
                {claim.notes || claim.additionalDetails || 'No additional notes available.'}
              </p>
            </div>
          )}

          {/* Proof Attachment - Always show container */}
          <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
            <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
              <FileText size={18} className="mr-2" />
              Attached Proof
            </h4>
            {claim.proofUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <a
                    href={claim.proofUrl.startsWith('http') ? claim.proofUrl : `/${claim.proofUrl.replace(/^\/?/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-md border border-[#AAB396] bg-[#F7EED3] text-sm font-medium text-[#674636] hover:bg-[#674636] hover:text-[#FFF8E8] transition-colors flex items-center"
                  >
                    <FileText size={16} className="mr-2" />
                    Open Proof Document
                  </a>
                </div>
                <div className="flex items-start">
                  <span className="text-xs text-[#AAB396] mr-2">File Path:</span>
                  <span className="text-xs text-[#674636] font-mono break-all">{claim.proofUrl}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center p-3 bg-[#F7EED3] rounded-md border border-[#AAB396]">
                <AlertCircle size={16} className="mr-2 text-[#AAB396]" />
                <span className="text-sm text-[#AAB396]">No proof document attached to this claim</span>
              </div>
            )}
          </div>
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