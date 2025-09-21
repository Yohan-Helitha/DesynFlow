import React from 'react'
import { X, Download, Send, CheckCircle, Clock } from 'lucide-react'

export const ViewQuotationModal = ({ quotation, onClose }) => {
  // Mock line items for the quotation
  const lineItems = [
    {
      id: 1,
      description: 'Materials - Standard Grade',
      quantity: 1,
      unitPrice: Math.round(quotation.totalAmount * 0.5),
      total: Math.round(quotation.totalAmount * 0.5),
    },
    {
      id: 2,
      description: 'Labor - Professional Installation',
      quantity: 1,
      unitPrice: Math.round(quotation.totalAmount * 0.3),
      total: Math.round(quotation.totalAmount * 0.3),
    },
    {
      id: 3,
      description: 'Equipment Rental',
      quantity: 1,
      unitPrice: Math.round(quotation.totalAmount * 0.1),
      total: Math.round(quotation.totalAmount * 0.1),
    },
    {
      id: 4,
      description: 'Miscellaneous Expenses',
      quantity: 1,
      unitPrice: Math.round(quotation.totalAmount * 0.1),
      total: Math.round(quotation.totalAmount * 0.1),
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Quotation Details</h3>
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
                Quotation Information
              </h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Quotation ID:</span>{' '}
                  {quotation.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Estimation ID:</span>{' '}
                  {quotation.estimationId}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      quotation.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {quotation.status}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Created Date:</span>{' '}
                  {quotation.createdDate}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Created By:</span>{' '}
                  {quotation.createdBy}
                </p>
                {quotation.status === 'Approved' && (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Approved Date:</span>{' '}
                      {quotation.approvedDate}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Approved By:</span>{' '}
                      {quotation.approvedBy}
                    </p>
                  </>
                )}
                <p className="text-sm">
                  <span className="font-medium">Valid Until:</span>{' '}
                  {quotation.validUntil}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Client Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Client Name:</span>{' '}
                  {quotation.clientName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span>{' '}
                  {quotation.clientEmail}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span>{' '}
                  {quotation.clientPhone}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Project Type:</span>{' '}
                  {quotation.projectType}
                </p>
                {quotation.status === 'Approved' && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-1">Client Response:</p>
                    <div className="flex items-center">
                      {quotation.sentToClient ? (
                        <>
                          {quotation.clientViewed ? (
                            <>
                              {quotation.clientResponse === 'Accepted' ? (
                                <>
                                  <CheckCircle
                                    size={16}
                                    className="text-green-500 mr-2"
                                  />
                                  <span className="text-sm text-green-700">
                                    Accepted by client
                                  </span>
                                </>
                              ) : quotation.clientResponse === 'Rejected' ? (
                                <>
                                  <X size={16} className="text-red-500 mr-2" />
                                  <span className="text-sm text-red-700">
                                    Rejected by client
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Clock
                                    size={16}
                                    className="text-yellow-500 mr-2"
                                  />
                                  <span className="text-sm text-yellow-700">
                                    Viewed, awaiting response
                                  </span>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Send size={16} className="text-blue-500 mr-2" />
                              <span className="text-sm text-blue-700">
                                Sent, not viewed yet
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Not sent to client yet
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Quotation Line Items
          </h4>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {item.description}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 text-right">
                        ${item.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 text-right">
                        ${item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100">
                    <td
                      colSpan="3"
                      className="px-4 py-2 text-sm font-medium text-right"
                    >
                      Total Amount:
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-right">
                      ${quotation.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            <p>Terms and Conditions:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>This quotation is valid until {quotation.validUntil}</li>
              <li>50% advance payment required to begin work</li>
              <li>Remaining payment due upon completion</li>
              <li>
                Any changes to the scope of work may result in additional
                charges
              </li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 flex items-center">
              <Download size={16} className="mr-2" />
              Download PDF
            </button>
            {quotation.status === 'Approved' && !quotation.sentToClient && (
              <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center">
                <Send size={16} className="mr-2" />
                Send to Client
              </button>
            )}
            {quotation.status === 'Pending' && (
              <>
                <button className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700">
                  Approve
                </button>
                <button className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700">
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
