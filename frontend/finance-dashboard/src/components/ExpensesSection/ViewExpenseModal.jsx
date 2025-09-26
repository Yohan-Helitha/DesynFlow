import React from 'react'
import { X, Download } from 'lucide-react'

export const ViewExpenseModal = ({ expense, onClose }) => {
  const isApproved = expense.status === 'Approved'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#AAB396]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396] bg-[#F7EED3]">
          <h3 className="text-lg font-semibold text-[#674636]">Expense Details</h3>
          <button onClick={onClose} className="text-[#674636] hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Expense Information */}
            <div>
              <h4 className="text-sm font-medium text-[#674636] mb-2">
                Expense Information
              </h4>
              <div className="bg-[#F7EED3] p-4 rounded-md space-y-2">
                <p className="text-sm text-[#674636]">
                  <span className="font-medium">Expense ID:</span> {expense.id}
                </p>
                <p className="text-sm text-[#674636]">
                  <span className="font-medium">Description:</span> {expense.description}
                </p>
                <p className="text-sm text-[#674636]">
                  <span className="font-medium">Category:</span> {expense.category}
                </p>
                <p className="text-sm text-[#674636]">
                  <span className="font-medium">Amount:</span> ${expense.amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Submission Details */}
            <div>
              <h4 className="text-sm font-medium text-[#674636] mb-2">Submission Details</h4>
              <div className="bg-[#F7EED3] p-4 rounded-md space-y-2">
                <p className="text-sm text-[#674636]">
                  <span className="font-medium">Submitted By:</span> {expense.submittedBy}
                </p>
                {isApproved && (
                  <>
                    <p className="text-sm text-[#674636]">
                      <span className="font-medium">Approved By:</span> {expense.approvedBy}
                    </p>
                    <p className="text-sm text-[#674636]">
                      <span className="font-medium">Approved Date:</span> {expense.approvedDate}
                    </p>
                  </>
                )}
                <p className="text-sm text-[#674636]">
                  <span className="font-medium">Receipt:</span>{' '}
                  {expense.proof ? (
                    <a
                      href={expense.proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#674636] underline hover:text-black"
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
                  <h4 className="text-sm font-medium text-[#674636] mb-2">Notes</h4>
                  <div className="bg-[#F7EED3] p-4 rounded-md">
                    <p className="text-sm text-[#674636]">{expense.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-[#674636] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#AAB396] flex items-center">
              <Download size={16} className="mr-2" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
