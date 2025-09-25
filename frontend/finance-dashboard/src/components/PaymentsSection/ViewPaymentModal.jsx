import React, { useState } from 'react'
import { X, Download, Check, AlertTriangle } from 'lucide-react'

export const ViewPaymentModal = ({ payment, onClose }) => {
  const isVerified = payment.status === 'Verified'
  const [comment, setComment] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Payment Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Payment Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Payment ID:</span> {payment._id || payment.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Amount:</span> ${payment.amount?.toLocaleString()}
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
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </p>
                {isVerified && payment.updatedAt && (
                  <p className="text-sm">
                    <span className="font-medium">Verified At:</span> {new Date(payment.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Client Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Client Details</h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Client ID:</span> {payment.clientId}
                </p>
                {payment.clientName && (
                  <p className="text-sm">
                    <span className="font-medium">Client Name:</span> {payment.clientName}
                  </p>
                )}
                {payment.clientEmail && (
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {payment.clientEmail}
                  </p>
                )}
                {payment.clientPhone && (
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> {payment.clientPhone}
                  </p>
                )}
              </div>

              {payment.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm">{payment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comment Section */}
          {!isVerified && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={500}
                placeholder="Add a comment for approval or rejection..."
              />
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>

            {payment.receiptUrl && (
              <a
                href={payment.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center mr-2"
              >
                <Download size={16} className="mr-2" />
                View Receipt
              </a>
            )}
            {!isVerified && (
              <>
                <button
                  className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 flex items-center"
                  onClick={async () => {
                    await fetch(`/api/payments/${payment._id || payment.id}/status`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'Approved', comment })
                    });
                    onClose();
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
                      body: JSON.stringify({ status: 'Rejected', comment })
                    });
                    onClose();
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
