import React from 'react';
import { X, CreditCard, User, Calendar, DollarSign, MapPin, Building, Phone, Mail, FileText, ExternalLink } from 'lucide-react';

export const ViewInspectionPaymentModal = ({ payment, onClose }) => {
  if (!payment) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-[#F7EED3] text-[#674636]';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396]">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
              <CreditCard size={20} />
            </div>
            <h3 className="text-lg font-semibold text-[#674636]">Payment Details</h3>
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
          {/* Basic Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <FileText size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Inspection Request ID</span>
                  <p className="font-medium font-mono text-xs">{payment.inspectionRequestId || payment._id || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <User size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Client ID</span>
                  <p className="font-medium font-mono text-xs">{payment.clientId || (payment.client && payment.client._id) || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-sm text-[#AAB396] mr-2">Payment Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status || (payment.estimation && payment.estimation.status))}`}>
                  {payment.status || (payment.estimation && payment.estimation.status) || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Estimated Cost</span>
                  <p className="font-medium text-lg">
                    ${payment.estimation && payment.estimation.estimatedCost !== undefined 
                      ? payment.estimation.estimatedCost.toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {payment.createdAt && (
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Request Date</span>
                    <p className="font-medium">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
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
                  <p className="font-medium">{payment.clientName || (payment.client && payment.client.name) || 'N/A'}</p>
                </div>
                
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Email</span>
                    <p className="font-medium">{payment.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Phone</span>
                    <p className="font-medium">{payment.phone || 'N/A'}</p>
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
                    <p className="font-medium">{payment.siteLocation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Building size={16} className="mr-2 text-[#AAB396]" />
                  <div>
                    <span className="text-sm text-[#AAB396]">Property Type</span>
                    <p className="font-medium">{payment.propertyType || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receipt */}
          {payment.paymentReceiptUrl && (
            <div className="bg-[#F7EED3] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
                <FileText size={18} className="mr-2" />
                Payment Receipt
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-[#674636]">Receipt available for download</span>
                <a
                  href={payment.paymentReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-[#674636] text-[#FFF8E8] rounded-md hover:bg-[#AAB396] transition-colors"
                >
                  <ExternalLink size={16} className="mr-2" />
                  View Receipt
                </a>
              </div>
            </div>
          )}

          {/* Notes or Description */}
          {(payment.notes || payment.description) && (
            <div className="bg-[#F7EED3] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-2">Additional Notes</h4>
              <p className="text-[#674636] text-sm leading-relaxed">
                {payment.notes || payment.description}
              </p>
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