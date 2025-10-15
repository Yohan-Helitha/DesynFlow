import React from 'react'
import { X } from 'lucide-react'

export const ViewPurchaseOrderModal = ({ purchaseOrder, onClose }) => {
  const isApproved = purchaseOrder.status === 'Approved'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#AAB396]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396] bg-[#F7EED3]">
          <h3 className="text-lg font-medium text-[#674636]">Purchase Order Details</h3>
          <button
            onClick={onClose}
            className="text-[#AAB396] hover:text-[#674636]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Section */}
            <div>
              <h4 className="text-sm font-medium text-[#674636] mb-2">
                Purchase Order Information
              </h4>
              <div className="bg-[#F7EED3] p-4 rounded-md space-y-2">
                <p className="text-sm text-[#674636]">
                  <span className="font-medium">PO Number:</span> {purchaseOrder.id}
                </p>
                {purchaseOrder.projectId && (
                  <p className="text-sm text-[#674636]">
                    <span className="font-medium">Project ID:</span> {purchaseOrder.projectId}
                  </p>
                )}
                {purchaseOrder.projectName && (
                  <p className="text-sm text-[#674636]">
                    <span className="font-medium">Project Name:</span> {purchaseOrder.projectName}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium text-[#674636]">Status:</span>{' '}
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isApproved
                        ? 'bg-[#AAB396] text-[#FFF8E8]'
                        : 'bg-[#F7EED3] text-[#674636]'
                    }`}
                  >
                    {purchaseOrder.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div>
              <h4 className="text-sm font-medium text-[#674636] mb-2">Vendor</h4>
              <div className="bg-[#F7EED3] p-4 rounded-md space-y-2">
                {purchaseOrder.vendor && (
                  <p className="text-sm text-[#674636]">
                    <span className="font-medium">Vendor:</span> {purchaseOrder.vendor}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <h4 className="text-sm font-medium text-[#674636] mb-2">Order Items</h4>
          <div className="bg-[#F7EED3] p-4 rounded-md mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#AAB396]">
                <thead className="bg-[#AAB396]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
                  {purchaseOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm text-[#674636]">{item.name}</td>
                      <td className="px-4 py-2 text-sm text-[#674636] text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-[#674636] text-right">
                        LKR {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-[#674636] text-right">
                        LKR {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#F7EED3]">
                    <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right text-[#674636]">
                      Total Amount:
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-right text-[#674636]">
                      LKR {purchaseOrder.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-[#FFF8E8]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
