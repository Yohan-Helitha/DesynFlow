import React, { useState } from 'react'
import { X, Check, AlertTriangle } from 'lucide-react'

export const PaymentActionModal = ({ payment, actionType, onClose }) => {
  const [rejectionReason, setRejectionReason] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would update the payment status in your backend
    console.log('Updating payment status:', {
      paymentId: payment.id,
      action: actionType,
      ...(actionType === 'reject' && {
        reason: rejectionReason,
      }),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">
            {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Client Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm mb-1">
                  <span className="font-medium">Name:</span> {payment.clientName}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Email:</span> {payment.clientEmail}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {payment.clientPhone}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Payment Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm mb-1">
                  <span className="font-medium">Amount:</span> ${payment.amountPaid}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Submission Date:</span> {payment.submittedDate}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Receipt:</span>{' '}
                  <a
                    href={payment.paymentReceipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Receipt
                  </a>
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {actionType === 'approve' ? (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
                <Check size={20} className="text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Confirm Payment Approval
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    You are about to approve a payment of ${payment.amountPaid}{' '}
                    for inspection {payment.id}. This action cannot be undone.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                  <AlertTriangle size={20} className="text-red-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Confirm Payment Rejection
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      You are about to reject a payment of ${payment.amountPaid}{' '}
                      for inspection {payment.id}. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="rejectionReason"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Rejection Reason
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    placeholder="Please provide a reason for rejecting this payment"
                  ></textarea>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
