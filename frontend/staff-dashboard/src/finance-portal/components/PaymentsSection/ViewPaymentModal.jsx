import React, { useState } from 'react'
import { X, Download, Check } from 'lucide-react'
import { buildUploadsUrl } from '../../utils/fileUrls'

export const ViewPaymentModal = ({ payment, onClose, onUpdate }) => {
  const isVerified = payment.status === 'Verified'
  const [comment, setComment] = useState("")

  // Helper functions for safe data extraction
  const getClientName = () => {
    if (payment?.clientId && typeof payment.clientId === 'object') {
      return payment.clientId.name || payment.clientId.username || payment.clientId.email || 'Unknown Client';
    }
    return payment?.clientName || 'Unknown Client';
  };

  const getClientEmail = () => {
    if (payment?.clientId && typeof payment.clientId === 'object') {
      return payment.clientId.email || 'No email provided';
    }
    return payment?.clientEmail || 'No email provided';
  };

  const getClientPhone = () => {
    if (payment?.clientId && typeof payment.clientId === 'object') {
      return payment.clientId.phone || payment.clientId.phoneNumber || 'Not provided';
    }
    return payment?.clientPhone || 'Not provided';
  };

  const getClientId = () => {
    if (payment?.clientId && typeof payment.clientId === 'object') {
      return payment.clientId._id || '-';
    }
    return payment?.clientId || '-';
  };

  const getProjectName = () => {
    if (payment?.projectId && typeof payment.projectId === 'object') {
      return payment.projectId.projectName || payment.projectId.name || 'Unknown Project';
    }
    return payment?.projectName || 'No Project';
  };

  const getProjectId = () => {
    if (payment?.projectId && typeof payment.projectId === 'object') {
      return payment.projectId._id || '-';
    }
    return payment?.projectId || '-';
  };

  const getProjectStatus = () => {
    if (payment?.projectId && typeof payment.projectId === 'object') {
      return payment.projectId.status || 'N/A';
    }
    return 'N/A';
  };

  const getProjectLocation = () => {
    if (payment?.projectId && typeof payment.projectId === 'object') {
      return payment.projectId.location || 'Not specified';
    }
    return 'Not specified';
  };

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
        <div className="p-6 space-y-6">
          {/* Project Information */}
          {payment.projectId && (
            <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
              <h4 className="text-sm font-semibold text-[#674636] mb-3">Project Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-[#674636] space-y-2">
                  <p>
                    <span className="font-medium">Project Name:</span> {getProjectName()}
                  </p>
                  <p>
                    <span className="font-medium">Project ID:</span>{' '}
                    <span className="font-mono text-xs">{getProjectId()}</span>
                  </p>
                </div>
                <div className="text-sm text-[#674636] space-y-2">
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#AAB396] text-[#FFF8E8]">
                      {getProjectStatus()}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {getProjectLocation()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Info */}
            <div>
              <h4 className="text-sm font-semibold text-[#674636] mb-3">Payment Information</h4>
              <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396] space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Payment ID:</span>{' '}
                  <span className="font-mono text-xs">{payment._id || payment.id}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Amount:</span> LKR {payment.amount?.toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Method:</span> {payment.method}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Type:</span> {payment.type}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isVerified
                        ? 'bg-green-200 text-green-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </p>
                {isVerified && payment.updatedAt && (
                  <p className="text-sm">
                    <span className="font-medium">Verified At:</span>{' '}
                    {new Date(payment.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Client Info */}
            <div>
              <h4 className="text-sm font-semibold text-[#674636] mb-3">Client Details</h4>
              <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396] space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Client Name:</span> {getClientName()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Client ID:</span>{' '}
                  <span className="font-mono text-xs">{getClientId()}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {getClientEmail()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {getClientPhone()}
                </p>
              </div>

              {payment.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-[#674636] mb-3">Notes</h4>
                  <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
                    <p className="text-sm">{payment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comment Section */}
          {!isVerified && (
            <div>
              <label className="block text-sm font-semibold text-[#674636] mb-3">
                Comment (optional)
              </label>
              <textarea
                className="w-full border border-[#AAB396] rounded-md p-3 text-sm bg-[#F7EED3] focus:outline-none focus:ring-2 focus:ring-[#674636]"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                placeholder="Add a comment for approval or rejection..."
              />
            </div>
          )}

           {/* Receipt Preview */}
           {payment.receiptUrl && (
             <div>
               <div className="text-sm font-semibold text-[#674636] mb-3">Receipt Preview</div>
               <div className="bg-[#F7EED3] p-3 rounded-md border border-[#AAB396]">
                 {(() => {
                   const url = buildUploadsUrl(payment.receiptUrl, 'payments');
                   const isPdf = /\.pdf($|\?)/i.test(url);
                   if (isPdf) {
                     return (
                       <iframe
                         src={url}
                         title="Receipt Preview"
                         className="w-full h-64 border border-[#AAB396] rounded bg-white"
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
             </div>
           )}

           {/* Footer buttons */}
           <div className="flex flex-wrap justify-end space-x-3 mt-6">
             <button
               onClick={onClose}
               className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white"
             >
               Close
             </button>

             {payment.receiptUrl && (
               <a
                 href={buildUploadsUrl(payment.receiptUrl, 'payments')}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="px-4 py-2 bg-[#674636] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#AAB396] flex items-center mr-2"
               >
                 <Download size={16} className="mr-2" />
                 View Receipt
               </a>
             )}
             {!isVerified && (
               <>
                 <button
                   className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                   disabled={!payment.receiptUrl}
                   title={!payment.receiptUrl ? "Cannot verify payment without receipt upload" : ""}
                   onClick={async () => {
                     await fetch(`/api/payments/${payment._id || payment.id}/status`, {
                       method: 'PATCH',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ status: 'Approved', comment }),
                     })
                     if (onUpdate) onUpdate(); // Trigger refresh in parent component
                     onClose()
                   }}
                 >
                   <Check size={16} className="mr-2" />
                   Verify Payment
                 </button>
                 <button
                   className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                   onClick={async () => {
                     await fetch(`/api/payments/${payment._id || payment.id}/status`, {
                       method: 'PATCH',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ status: 'Rejected', comment }),
                     })
                     if (onUpdate) onUpdate(); // Trigger refresh in parent component
                     onClose()
                   }}
                 >
                   Reject Payment
                 </button>
               </>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}
