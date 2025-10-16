import React, { useMemo } from 'react'
import { X, Download } from 'lucide-react'

export const ViewExpenseModal = ({ expense, onClose }) => {
  const isApproved = expense.status === 'Approved'

  // Helper functions for safe data extraction
  const getProjectName = () => {
    if (expense?.projectId && typeof expense.projectId === 'object') {
      return expense.projectId.projectName || expense.projectId.name || 'Unknown Project';
    }
    return expense?.projectName || 'No Project';
  };

  const getProjectId = () => {
    if (expense?.projectId && typeof expense.projectId === 'object') {
      return expense.projectId._id || '-';
    }
    return expense?.projectId || '-';
  };

  const getProjectStatus = () => {
    if (expense?.projectId && typeof expense.projectId === 'object') {
      return expense.projectId.status || 'N/A';
    }
    return 'N/A';
  };

  const getProjectLocation = () => {
    if (expense?.projectId && typeof expense.projectId === 'object') {
      return expense.projectId.location || 'Not specified';
    }
    return 'Not specified';
  };

  const getSubmittedBy = () => {
    if (expense?.createdBy && typeof expense.createdBy === 'object') {
      return expense.createdBy.name || expense.createdBy.username || expense.createdBy.email || 'Unknown User';
    }
    return expense?.submittedBy || 'Unknown User';
  };

  const proofUrl = useMemo(() => {
    if (!expense?.proof) return null
    const raw = String(expense.proof).replace(/\\/g, '/')
    if (/^https?:\/\//i.test(raw)) return raw
    return raw.startsWith('/') ? raw : `/${raw}`
  }, [expense])

  const proofExt = useMemo(() => {
    if (!proofUrl) return null
    const qIndex = proofUrl.indexOf('?')
    const clean = qIndex >= 0 ? proofUrl.slice(0, qIndex) : proofUrl
    const m = clean.match(/\.([a-z0-9]+)$/i)
    return m ? m[1].toLowerCase() : null
  }, [proofUrl])

  // Use relative path; vite proxy maps /uploads -> backend
  const openUrl = useMemo(() => {
    if (!proofUrl) return null
    if (/^https?:\/\//i.test(proofUrl)) return proofUrl
    return proofUrl
  }, [proofUrl])

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
        <div className="p-6 space-y-6">
          {/* Project Information */}
          {expense.projectId && (
            <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
              <h4 className="text-sm font-semibold text-[#674636] mb-3">Project Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-[#674636] space-y-2">
                  <p>
                    <span className="font-medium">Project Name:</span> {getProjectName()}
                  </p>
                  <p>
                    <span className="font-medium">Project ID:</span>{' '}
                    <span className="font-mono text-xs">{getProjectId()}</span>
                  </p>
                </div>
                <div className="text-sm text-[#674636] space-y-2">
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#AAB396] text-[#FFF8E8]">
                      {getProjectStatus()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expense Information and Submission Details*/}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Information */}
            <div>
              <h4 className="text-sm font-semibold text-[#674636] mb-3">Expense Information</h4>
              <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396] space-y-2">
                <div className="text-sm text-[#674636]"><span className="font-medium">Expense ID:</span> <span className="font-mono text-xs">{expense.id || expense._id}</span></div>
                <div className="text-sm text-[#674636]"><span className="font-medium">Category:</span> {expense.category}</div>
                <div className="text-sm text-[#674636]"><span className="font-medium">Amount:</span> {typeof expense.amount === 'number' ? `LKR ${Number(expense.amount).toLocaleString()}` : '-'}</div>
                <div className="text-sm text-[#674636]"><span className="font-medium">Description:</span> {expense.description || '-'}</div>
              </div>
            </div>

            {/* Submission Details */}
            <div>
              <h4 className="text-sm font-semibold text-[#674636] mb-3">Submission Details</h4>
              <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396] space-y-2">
                {isApproved && (
                  <>
                    <p className="text-sm text-[#674636]"><span className="font-medium">Approved By:</span> {expense.approvedBy}</p>
                    <p className="text-sm text-[#674636]"><span className="font-medium">Approved Date:</span> {expense.approvedDate}</p>
                  </>
                )}
                <div className="text-sm text-[#674636]">
                  <span className="font-medium">Receipt:</span>{' '}
                  {!proofUrl ? <span className="text-gray-400">No Receipt</span> : <span className="text-[#674636]">Attached</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Notes - Full Width */}
          {expense.notes && (
            <div>
              <h4 className="text-sm font-semibold text-[#674636] mb-3">Notes</h4>
              <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
                <p className="text-sm text-[#674636]">{expense.notes}</p>
              </div>
            </div>
          )}

          {/* Preview - Full Width at Bottom */}
          {openUrl && (
            <div>
              <h4 className="text-sm font-semibold text-[#674636] mb-3">Receipt Preview</h4>
              <div className="bg-[#F7EED3] p-3 rounded-md border border-[#AAB396]">
                {proofExt && ['jpg','jpeg','png','gif','webp'].includes(proofExt) ? (
                  <img src={openUrl} alt="Receipt" className="w-full max-h-[500px] object-contain rounded" />
                ) : proofExt === 'pdf' ? (
                  <iframe src={openUrl} title="Receipt PDF" className="w-full h-[500px] bg-white rounded" />
                ) : (
                  <a href={openUrl} target="_blank" rel="noopener noreferrer" className="text-[#674636] underline hover:text-black">Open Receipt</a>
                )}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white">Close</button>
            {openUrl ? (
              <button onClick={() => window.open(openUrl, '_blank', 'noopener,noreferrer')} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium flex items-center bg-[#674636] text-white hover:bg-[#AAB396]">
                <Download size={16} className="mr-2" /> {proofExt === 'pdf' ? 'Open PDF' : 'Open Receipt'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
