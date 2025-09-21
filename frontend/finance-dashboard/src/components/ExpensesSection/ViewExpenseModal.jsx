import React from 'react'
import { X, Download, Check } from 'lucide-react'

export const ViewExpenseModal = ({ expense, onClose }) => {
  const isApproved = expense.status === 'Approved'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Expense Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Expense Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Expense Information
              </h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Expense ID:</span> {expense.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Description:</span> {expense.description}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Category:</span> {expense.category}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Amount:</span> ${expense.amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Submission Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Submission Details</h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Submitted By:</span> {expense.submittedBy}
                </p>
                {isApproved && (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Approved By:</span> {expense.approvedBy}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Approved Date:</span> {expense.approvedDate}
                    </p>
                  </>
                )}
                <p className="text-sm">
                  <span className="font-medium">Receipt:</span>{' '}
                  {expense.proof ? (
                    <a
                      href={expense.proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 underline"
                    >
                      View Receipt
                    </a>
                  ) : (
                    <span className="text-gray-400">No Receipt</span>
                  )}
                </p>
              </div>

              {expense.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm">{expense.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 flex items-center">
              <Download size={16} className="mr-2" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
