import React from 'react'
import { X, Download, Check, Truck } from 'lucide-react'

export const ViewPurchaseOrderModal = ({ purchaseOrder, onClose }) => {
  const isApproved = purchaseOrder.status === 'Approved'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Purchase Order Details</h3>
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
                Purchase Order Information
              </h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="text-sm">
                  <span className="font-medium">PO Number:</span>{' '}
                  {purchaseOrder.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Project ID:</span>{' '}
                  {purchaseOrder.projectId}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Project Name:</span>{' '}
                  {purchaseOrder.projectName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {purchaseOrder.status}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Priority:</span>{' '}
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      purchaseOrder.priority === 'High'
                        ? 'bg-red-100 text-red-800'
                        : purchaseOrder.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {purchaseOrder.priority}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Requested By:</span>{' '}
                  {purchaseOrder.requestedBy}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Requested Date:</span>{' '}
                  {purchaseOrder.requestedDate}
                </p>
                {isApproved && (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Approved By:</span>{' '}
                      {purchaseOrder.approvedBy}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Approved Date:</span>{' '}
                      {purchaseOrder.approvedDate}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Vendor & Delivery Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Vendor:</span>{' '}
                  {purchaseOrder.vendor}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Expected Delivery Date:</span>{' '}
                  {purchaseOrder.deliveryDate}
                </p>
                {isApproved && (
                  <p className="text-sm">
                    <span className="font-medium">Delivery Status:</span>{' '}
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchaseOrder.deliveryStatus === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : purchaseOrder.deliveryStatus === 'In Transit'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {purchaseOrder.deliveryStatus}
                    </span>
                  </p>
                )}
                {purchaseOrder.deliveryStatus === 'Delivered' && (
                  <p className="text-sm">
                    <span className="font-medium">Delivered Date:</span>{' '}
                    {purchaseOrder.deliveryDate}
                  </p>
                )}
              </div>
            </div>
          </div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Order Items
          </h4>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#AAB396]">
                <thead className="bg-[#F7EED3]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
                  {purchaseOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {item.name}
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
                      colSpan={3}
                      className="px-4 py-2 text-sm font-medium text-right"
                    >
                      Total Amount:
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-right">
                      ${purchaseOrder.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>
            {isApproved ? (
              <>
                <button className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 flex items-center">
                  <Download size={16} className="mr-2" />
                  Download PO
                </button>
                {purchaseOrder.deliveryStatus !== 'Delivered' && (
                  <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center">
                    <Truck size={16} className="mr-2" />
                    Track Order
                  </button>
                )}
              </>
            ) : (
              <>
                <button className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 flex items-center">
                  <Check size={16} className="mr-2" />
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
