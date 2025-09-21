import React from 'react'
import { X, Download, Check, AlertTriangle } from 'lucide-react'

export const ViewPaymentModal = ({ payment, onClose }) => {
  const isVerified = payment.status === 'Verified'

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
                  <span className="font-medium">Payment ID:</span> {payment.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Quotation ID:</span> {payment.quotationId}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Amount Paid:</span> $
                  {payment.amountPaid != null ? payment.amountPaid.toLocaleString() : '0.00'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Total Amount:</span> $
                  {payment.totalAmount != null ? payment.totalAmount.toLocaleString() : '0.00'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Payment Type:</span> {payment.paymentType}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Payment Method:</span> {payment.paymentMethod}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Payment Date:</span> {payment.paymentDate}
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

                {isVerified && (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Verification Date:</span>{' '}
                      {payment.verificationDate}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Verified By:</span>{' '}
                      {payment.verifiedBy}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Receipt Number:</span>{' '}
                      {payment.receiptNumber}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Client Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Client Details</h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Client Name:</span> {payment.clientName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {payment.clientEmail}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {payment.clientPhone}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Project Type:</span> {payment.projectType}
                </p>
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

          {/* Warning for pending */}
          {!isVerified && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
              <AlertTriangle size={20} className="text-yellow-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Payment Verification Required</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This payment needs to be verified before it can be processed. Please check the
                  payment details and confirm receipt.
                </p>
              </div>
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

            {isVerified ? (
              <button className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 flex items-center">
                <Download size={16} className="mr-2" />
                Download Receipt
              </button>
            ) : (
              <>
                <button className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 flex items-center">
                  <Check size={16} className="mr-2" />
                  Verify Payment
                </button>
                <button className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700">
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
