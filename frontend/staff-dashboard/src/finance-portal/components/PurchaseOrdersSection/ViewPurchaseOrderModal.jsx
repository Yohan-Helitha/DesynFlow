import React from 'react'
import { X } from 'lucide-react'

export const ViewPurchaseOrderModal = ({ purchaseOrder, onClose }) => {
  const isApproved = purchaseOrder.status === 'Approved'

  // Helper functions for safe data extraction
  const getSupplierName = () => {
    if (purchaseOrder.supplierInfo && typeof purchaseOrder.supplierInfo === 'object') {
      return purchaseOrder.supplierInfo.companyName || purchaseOrder.supplierInfo.contactName || purchaseOrder.supplierInfo.name || purchaseOrder.supplierInfo.email || 'Unknown Supplier';
    }
    return purchaseOrder.vendor || 'Unknown Supplier';
  };

  const getSupplierEmail = () => {
    if (purchaseOrder.supplierInfo && typeof purchaseOrder.supplierInfo === 'object') {
      return purchaseOrder.supplierInfo.email || 'No email provided';
    }
    return 'No email provided';
  };

  const getSupplierPhone = () => {
    if (purchaseOrder.supplierInfo && typeof purchaseOrder.supplierInfo === 'object') {
      return purchaseOrder.supplierInfo.phone || purchaseOrder.supplierInfo.phoneNumber || 'Not provided';
    }
    return 'Not provided';
  };

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
        <div className="p-6 space-y-6">
          {/* Purchase Order Information */}
          <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
            <h4 className="text-sm font-semibold text-[#674636] mb-3">Purchase Order Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm text-[#674636] space-y-2">
                <p>
                  <span className="font-medium">PO Number:</span> <span className="font-mono text-xs">{purchaseOrder.id}</span>
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isApproved
                        ? 'bg-[#AAB396] text-[#FFF8E8]'
                        : 'bg-[#674636] text-[#FFF8E8]'
                    }`}
                  >
                    {purchaseOrder.status}
                  </span>
                </p>
              </div>
              <div className="text-sm text-[#674636] space-y-2">
                {purchaseOrder.requestedDate && (
                  <p>
                    <span className="font-medium">Requested Date:</span> {purchaseOrder.requestedDate}
                  </p>
                )}
                {purchaseOrder.approvedDate && (
                  <p>
                    <span className="font-medium">Approved Date:</span> {purchaseOrder.approvedDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project Information */}
          {(purchaseOrder.projectId || purchaseOrder.projectName) && (
            <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
              <h4 className="text-sm font-semibold text-[#674636] mb-3">Project Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-[#674636] space-y-2">
                  {purchaseOrder.projectId && (
                    <p>
                      <span className="font-medium">Project ID:</span>{' '}
                      <span className="font-mono text-xs">{purchaseOrder.projectId}</span>
                    </p>
                  )}
                  {purchaseOrder.projectName && (
                    <p>
                      <span className="font-medium">Project Name:</span> {purchaseOrder.projectName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Supplier Information */}
          {(purchaseOrder.vendor || purchaseOrder.supplierInfo) && (
            <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
              <h4 className="text-sm font-semibold text-[#674636] mb-3">Supplier Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-[#674636] space-y-2">
                  <p>
                    <span className="font-medium">Supplier Name:</span> {getSupplierName()}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {getSupplierEmail()}
                  </p>
                </div>
                <div className="text-sm text-[#674636] space-y-2">
                  <p>
                    <span className="font-medium">Phone:</span> {getSupplierPhone()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
            <h4 className="text-sm font-semibold text-[#674636] mb-3">Order Items</h4>
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
