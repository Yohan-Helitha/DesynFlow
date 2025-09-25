import React from 'react'
import { X, Download, Send, CheckCircle, Clock } from 'lucide-react'

export const ViewQuotationModal = ({ quotation, onClose }) => {
  // Helper for safe display
  const getProjectDisplay = (q) => {
    const p = q.projectId;
    if (!p) return '';
    if (typeof p === 'string') return p;
    if (p.projectName) return p.projectName;
    if (p._id) return String(p._id);
    return '';
  };
  const getUserDisplay = (u) => {
    if (!u) return '';
    if (typeof u === 'string') return u;
    if (u.name) return u.name;
    if (u.email) return u.email;
    if (u._id) return String(u._id);
    return '';
  };

  // Combine all line items for display
  const allLineItems = [
    ...(quotation.laborItems || []).map((item, idx) => ({
      type: 'Labor',
      ...item,
      key: `labor-${idx}`
    })),
    ...(quotation.materialItems || []).map((item, idx) => ({
      type: 'Material',
      ...item,
      key: `material-${idx}`
    })),
    ...(quotation.serviceItems || []).map((item, idx) => ({
      type: 'Service',
      ...item,
      key: `service-${idx}`
    })),
    ...(quotation.contingencyItems || []).map((item, idx) => ({
      type: 'Contingency',
      ...item,
      key: `contingency-${idx}`
    })),
    ...(quotation.taxes || []).map((item, idx) => ({
      type: 'Tax',
      ...item,
      key: `tax-${idx}`
    })),
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396]">
          <h3 className="text-lg font-medium text-[#674636]">Quotation Details</h3>
          <button
            onClick={onClose}
            className="text-[#AAB396] hover:text-[#674636]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-[#AAB396] mb-2">
                Quotation Information
              </h4>
              <div className="bg-[#F7EED3] p-4 rounded-md space-y-2 text-[#674636]">
                <p className="text-sm"><span className="font-medium">Quotation ID:</span> {quotation._id}</p>
                <p className="text-sm"><span className="font-medium">Project:</span> {getProjectDisplay(quotation)}</p>
                <p className="text-sm"><span className="font-medium">Version:</span> {quotation.version}</p>
                <p className="text-sm"><span className="font-medium">Estimate Version:</span> {quotation.estimateVersion}</p>
                <p className="text-sm"><span className="font-medium">Status:</span> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${quotation.status === 'Confirmed' ? 'bg-[#AAB396] text-[#FFF8E8] border border-[#674636]' : 'bg-[#F7EED3] text-[#AAB396] border border-[#AAB396]'}`}>{quotation.status}</span></p>
                <p className="text-sm"><span className="font-medium">Locked:</span> {quotation.locked ? 'Yes' : 'No'}</p>
                <p className="text-sm"><span className="font-medium">Created At:</span> {quotation.createdAt ? new Date(quotation.createdAt).toLocaleString() : ''}</p>
                <p className="text-sm"><span className="font-medium">Created By:</span> {getUserDisplay(quotation.createdBy)}</p>
                <p className="text-sm"><span className="font-medium">Updated By:</span> {getUserDisplay(quotation.updatedBy)}</p>
                <p className="text-sm"><span className="font-medium">Remarks:</span> {quotation.remarks}</p>
                <p className="text-sm"><span className="font-medium">File URL:</span> {quotation.fileUrl}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#AAB396] mb-2">
                Client Details
              </h4>
              <div className="bg-[#F7EED3] p-4 rounded-md space-y-2 text-[#674636]">
                {/* You can add more client/project details here if available in quotation */}
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
                                    className="text-[#AAB396] mr-2"
                                  />
                                  <span className="text-sm text-[#674636]">
                                    Accepted by client
                                  </span>
                                </>
                              ) : quotation.clientResponse === 'Rejected' ? (
                                <>
                                  <X size={16} className="text-[#674636] mr-2" />
                                  <span className="text-sm text-[#674636]">
                                    Rejected by client
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Clock
                                    size={16}
                                    className="text-[#AAB396] mr-2"
                                  />
                                  <span className="text-sm text-[#AAB396]">
                                    Viewed, awaiting response
                                  </span>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Send size={16} className="text-[#674636] mr-2" />
                              <span className="text-sm text-[#674636]">
                                Sent, not viewed yet
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-[#AAB396]">
                          Not sent to client yet
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <h4 className="text-sm font-medium text-gray-500 mb-2">Quotation Line Items</h4>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#AAB396]">
                <thead className="bg-[#F7EED3]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Quantity/Hours</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Unit Price/Rate</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
                  {allLineItems.map((item) => (
                    <tr key={item.key}>
                      <td className="px-4 py-2 text-sm text-[#674636]">{item.type}</td>
                      <td className="px-4 py-2 text-sm text-[#674636]">{item.description || item.task || item.service}</td>
                      <td className="px-4 py-2 text-sm text-[#674636] text-right">{item.quantity ?? item.hours ?? ''}</td>
                      <td className="px-4 py-2 text-sm text-[#674636] text-right">{item.unitPrice ?? item.rate ?? item.cost ?? ''}</td>
                      <td className="px-4 py-2 text-sm text-[#674636] text-right">{item.total ?? item.amount ?? ''}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100">
                    <td colSpan="4" className="px-4 py-2 text-sm font-medium text-right">Subtotal:</td>
                    <td className="px-4 py-2 text-sm font-medium text-right">${quotation.subtotal?.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td colSpan="4" className="px-4 py-2 text-sm font-medium text-right">Total Contingency:</td>
                    <td className="px-4 py-2 text-sm font-medium text-right">${quotation.totalContingency?.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td colSpan="4" className="px-4 py-2 text-sm font-medium text-right">Total Tax:</td>
                    <td className="px-4 py-2 text-sm font-medium text-right">${quotation.totalTax?.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-gray-200">
                    <td colSpan="4" className="px-4 py-2 text-sm font-bold text-right">Grand Total:</td>
                    <td className="px-4 py-2 text-sm font-bold text-right">${quotation.grandTotal?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ...existing code... */}

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
          </div>
        </div>
      </div>
    </div>
  )
}
