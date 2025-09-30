import React from 'react';
import { X, Download } from 'lucide-react';
import { buildUploadsUrl } from '../../utils/fileUrls';

const PaymentDetailsModal = ({ payment, onClose }) => {
  if (!payment) return null;
  const isVerified = payment.status === 'Verified';
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#AAB396]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396]">
          <h3 className="text-lg font-medium text-[#674636]">Payment Details</h3>
          <button onClick={onClose} className="text-[#AAB396] hover:text-[#674636]">
            <X size={20} />
          </button>
        </div>
        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Payment Info */}
            <div>
              <h4 className="text-sm font-medium text-[#674636] mb-2">Payment Information</h4>
              <div className="bg-[#F7EED3] p-4 rounded-md space-y-2">
                <p className="text-sm"><span className="font-medium">Payment ID:</span> {payment._id || payment.id}</p>
                <p className="text-sm"><span className="font-medium">Amount:</span> ${payment.amount?.toLocaleString()}</p>
                <p className="text-sm"><span className="font-medium">Method:</span> {payment.method}</p>
                <p className="text-sm"><span className="font-medium">Type:</span> {payment.type}</p>
                <p className="text-sm"><span className="font-medium">Status:</span> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isVerified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{payment.status}</span></p>
                {isVerified && payment.updatedAt && (
                  <p className="text-sm"><span className="font-medium">Verified At:</span> {new Date(payment.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
            {/* Client Info */}
            <div>
              <h4 className="text-sm font-medium text-[#674636] mb-2">Client Details</h4>
              <div className="bg-[#F7EED3] p-4 rounded-md space-y-2">
                <p className="text-sm"><span className="font-medium">Client ID:</span> {payment.clientId}</p>
                {payment.clientName && (<p className="text-sm"><span className="font-medium">Client Name:</span> {payment.clientName}</p>)}
                {payment.clientEmail && (<p className="text-sm"><span className="font-medium">Email:</span> {payment.clientEmail}</p>)}
                {payment.clientPhone && (<p className="text-sm"><span className="font-medium">Phone:</span> {payment.clientPhone}</p>)}
              </div>
              {payment.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-[#674636] mb-2">Notes</h4>
                  <div className="bg-[#F7EED3] p-4 rounded-md">
                    <p className="text-sm">{payment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Receipt */}
          {payment.receiptUrl && (
            <div className="mt-4">
              <div className="text-sm font-medium text-[#674636] mb-2">Receipt Preview</div>
              {(() => {
                const url = buildUploadsUrl(payment.receiptUrl, 'payments');
                const isPdf = /\.pdf($|\?)/i.test(url);
                if (isPdf) {
                  return (
                    <iframe
                      src={url}
                      title="Receipt Preview"
                      className="w-full h-64 border border-[#AAB396] rounded"
                    />
                  );
                }
                return (
                  <img
                    src={url}
                    alt="Receipt Preview"
                    className="w-full h-64 object-contain border border-[#AAB396] rounded bg-white"
                  />
                );
              })()}
            </div>
          )}

          {/* Comment */}
          {payment.comment && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-[#674636] mb-2">Comment</h4>
              <div className="bg-[#F7EED3] p-4 rounded-md">
                <p className="text-sm">{payment.comment}</p>
              </div>
            </div>
          )}

          {/* Receipt */}
          <div className="flex items-center space-x-4 mt-4">
            {payment.receiptUrl ? (
              <a href={buildUploadsUrl(payment.receiptUrl, 'payments')} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#674636] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#AAB396] flex items-center">
                <Download size={16} className="mr-2" />
                View Receipt
              </a>
            ) : (
              <span className="text-gray-400">No Receipt</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;
