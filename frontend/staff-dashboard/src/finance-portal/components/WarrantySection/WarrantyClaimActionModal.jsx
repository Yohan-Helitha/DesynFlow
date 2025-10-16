import React, { useEffect, useState } from 'react';
import { X, FileText, User, Calendar, AlertCircle, CheckCircle, XCircle, Clock, Package, Truck } from 'lucide-react';


const WarrantyClaimActionModal = ({ claim, onClose, onAction }) => {
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

  // Extract warranty and client info from claim (may be populated or just IDs)
  const warranty = typeof claim.warrantyId === 'object' ? claim.warrantyId : null;
  const client = typeof claim.clientId === 'object' ? claim.clientId : null;
  const reviewer = typeof claim.financeReviewerId === 'object' ? claim.financeReviewerId : null;

  // Helper functions for safe data extraction
  const getClientName = () => {
    if (client) {
      return client.username || client.name || client.email || 'Unknown Client';
    }
    return 'Unknown Client';
  };

  const getClientEmail = () => {
    if (client) {
      return client.email || 'No email provided';
    }
    return 'No email provided';
  };

  const getClientPhone = () => {
    if (client) {
      return client.phone || client.phoneNumber || 'Not provided';
    }
    return 'Not provided';
  };

  const getClientAddress = () => {
    if (client) {
      return client.address || 'Not provided';
    }
    return 'Not provided';
  };

  const getProjectName = () => {
    if (warranty) {
      if (warranty.projectId && typeof warranty.projectId === 'object') {
        return warranty.projectId.projectName || warranty.projectId.name || 'Unknown Project';
      }
      return warranty.projectName || 'Unknown Project';
    }
    return 'Unknown Project';
  };

  const getMaterialType = () => {
    if (warranty) {
      if (warranty.itemId && typeof warranty.itemId === 'object') {
        return warranty.itemId.type || warranty.itemId.materialType || warranty.itemId.category || 'Unknown Type';
      }
      return warranty.materialType || warranty.type || 'Unknown Type';
    }
    return 'Unknown Type';
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not specified';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getReviewerName = () => {
    if (reviewer) {
      return reviewer.username || reviewer.name || reviewer.email || 'Unknown Reviewer';
    }
    return 'Not reviewed yet';
  };

  // Local state to fetch authoritative warranty status & period
  const [warrantyLoading, setWarrantyLoading] = useState(false);
  const [warrantyError, setWarrantyError] = useState(null);
  const [warrantyDetails, setWarrantyDetails] = useState(null); // raw doc
  const [warrantyComputed, setWarrantyComputed] = useState(null); // derived fields

  useEffect(() => {
    const id = warranty?._id || (typeof claim.warrantyId === 'string' ? claim.warrantyId : null);
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setWarrantyLoading(true);
        setWarrantyError(null);
        // Fetch raw document & dynamic status in parallel
        const [docRes, statusRes] = await Promise.all([
          fetch(`/api/warranties/${id}`),
          fetch(`/api/warranties/${id}/status`)
        ]);
        if (!docRes.ok) throw new Error(`Warranty fetch failed (${docRes.status})`);
        if (!statusRes.ok) throw new Error(`Warranty status fetch failed (${statusRes.status})`);
        const doc = await docRes.json();
        const statusPayload = await statusRes.json();
        if (cancelled) return;
        setWarrantyDetails(doc);
        // Determine dates (backend doc uses warrantyStart / warrantyEnd)
        const startRaw = doc.warrantyStart || doc.startDate;
        const endRaw = doc.warrantyEnd || doc.endDate;
        const startDate = startRaw ? new Date(startRaw) : null;
        const endDate = endRaw ? new Date(endRaw) : null;
        const now = new Date();
        // Compute in-period boolean using dates (authoritative irrespective of stored status)
        let inPeriod = false;
        if (startDate && endDate) {
          inPeriod = startDate <= now && endDate >= now;
        }
        // Compute days remaining / expired
        let daysRemaining = null;
        let daysExpired = null;
        if (endDate) {
          const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0) daysRemaining = diffDays; else daysExpired = Math.abs(diffDays);
        }
        const dynamicStatus = statusPayload.status || doc.status || (inPeriod ? 'Active' : 'Expired');
        setWarrantyComputed({
          startDate: startDate ? startDate.toISOString().split('T')[0] : 'N/A',
            endDate: endDate ? endDate.toISOString().split('T')[0] : 'N/A',
          inPeriod,
          status: dynamicStatus,
          daysRemaining,
          daysExpired,
        });
      } catch (e) {
        if (!cancelled) setWarrantyError(e.message);
      } finally {
        if (!cancelled) setWarrantyLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [claim.warrantyId]);

  const renderWarrantyPeriodBadge = () => {
    if (warrantyLoading) {
      return <span className="px-2 py-1 text-xs rounded-full bg-[#F7EED3] text-[#674636] border border-[#AAB396] animate-pulse">Checking...</span>;
    }
    if (warrantyError) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-400">Error</span>;
    }
    if (!warrantyComputed) {
      return <span className="px-2 py-1 text-xs rounded-full bg-[#F7EED3] text-[#AAB396] border border-[#AAB396]">Unknown</span>;
    }
    if (warrantyComputed.inPeriod) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-white border border-green-700">In Warranty</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-[#674636] text-[#FFF8E8] border border-[#674636]">Expired</span>;
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
                  <p className="font-medium font-mono text-xs">{warranty?._id || claim.warrantyId || 'Not linked'}</p>
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
                  <p className="font-medium">{formatDate(claim.createdAt)}</p>
                </div>
              </div>

              {claim.updatedAt && claim.updatedAt !== claim.createdAt && (
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Last Updated</span>
                    <p className="font-medium">{formatDate(claim.updatedAt)}</p>
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

          {/* Warranty Information with period verification */}
          {(warranty || warrantyComputed || warrantyLoading) && (
            <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-[#674636]">Related Warranty Information</h4>
                {renderWarrantyPeriodBadge()}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-[#AAB396]">Warranty ID</span>
                    <p className="font-medium font-mono text-xs">{warranty?._id || (typeof claim.warrantyId === 'string' ? claim.warrantyId : 'Not available')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Project Name</span>
                    <p className="font-medium">{getProjectName()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Material Type</span>
                    <p className="font-medium">{getMaterialType()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-[#AAB396]">Warranty Start</span>
                    <p className="font-medium">{warrantyComputed?.startDate || formatDate(warranty?.startDate || warranty?.warrantyStart || warrantyDetails?.warrantyStart)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Warranty End</span>
                    <p className="font-medium">{warrantyComputed?.endDate || formatDate(warranty?.endDate || warranty?.warrantyEnd || warrantyDetails?.warrantyEnd)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Dynamic Status</span>
                    <p className="font-medium">{warrantyComputed?.status || warranty?.status || 'Unknown'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-[#AAB396]">Days Remaining</span>
                    <p className="font-medium">{warrantyComputed?.daysRemaining ?? (warrantyComputed?.inPeriod ? '0' : '—')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Days Expired</span>
                    <p className="font-medium">{warrantyComputed?.daysExpired ?? (!warrantyComputed?.inPeriod && warrantyComputed ? '0' : '—')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Period Status</span>
                    <p className="font-medium">{warrantyComputed ? (warrantyComputed.inPeriod ? 'Within Warranty Period' : 'Outside Warranty Period') : 'Checking...'}</p>
                  </div>
                </div>
              </div>
              {warrantyError && (
                <div className="mt-3 text-xs text-red-600">{warrantyError}</div>
              )}
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
                    <p className="font-medium">{getClientPhone()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#AAB396]">Address</span>
                    <p className="font-medium">{getClientAddress()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Information */}
          {(claim.status === 'Approved' || claim.status === 'Rejected') && (
            <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-3">Review Details</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-[#AAB396]">Reviewed By</span>
                  <p className="font-medium">{getReviewerName()}</p>
                </div>
                {claim.reviewComments && (
                  <div>
                    <span className="text-sm text-[#AAB396]">Review Comments</span>
                    <p className="font-medium">{claim.reviewComments}</p>
                  </div>
                )}
                {claim.reviewDate && (
                  <div>
                    <span className="text-sm text-[#AAB396]">Review Date</span>
                    <p className="font-medium">{formatDate(claim.reviewDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warehouse Action Information removed per request */}

          {/* Additional Details */}
          {(claim.notes || claim.additionalDetails) && (
            <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-2">Additional Notes</h4>
              <p className="text-[#674636] text-sm leading-relaxed">
                {claim.notes || claim.additionalDetails || 'No additional notes available.'}
              </p>
            </div>
          )}

          {/* Proof Attachment, moved near the bottom */}
          {claim.proofUrl && (
            <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-3">Attached Proof</h4>
              <div className="flex items-center gap-3">
                <a
                  href={claim.proofUrl.startsWith('http') ? claim.proofUrl : `/${claim.proofUrl.replace(/^\/?/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-md border border-[#AAB396] bg-[#F7EED3] text-xs font-mono text-[#674636] hover:bg-[#674636] hover:text-[#FFF8E8]"
                >
                  Open Proof
                </a>
                <span className="text-xs text-[#AAB396] break-all">{claim.proofUrl}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-6 border-t border-[#AAB396] bg-[#F7EED3]">
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            onClick={async () => {
              await fetch(`/api/claims/${claim._id}/approve`, { method: 'PUT' });
              if (onAction) {
                onAction(); // Triggers refresh in parent component
              } else {
                onClose();
              }
            }}
          >
            Approve
          </button>
          <button
            className="px-6 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            onClick={async () => {
              await fetch(`/api/claims/${claim._id}/reject`, { method: 'PUT' });
              if (onAction) {
                onAction(); // Triggers refresh in parent component
              } else {
                onClose();
              }
            }}
          >
            Reject
          </button>
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

export default WarrantyClaimActionModal;
