import React from 'react'
import { X, Download } from 'lucide-react'

export const ViewQuotationModal = ({ quotation, onClose }) => {
  // Helpers
  const fmtMoney = (n) => `$${Number(n || 0).toLocaleString()}`
  const getProjectDisplay = (q) => {
    const p = q?.projectId
    if (!p) return ''
    if (typeof p === 'string') return p
    return p.projectName || p.name || p.title || p._id || ''
  }
  const getUserDisplay = (u) => {
    if (!u) return ''
    if (typeof u === 'string') return u
    return u.name || u.fullName || u.email || u._id || ''
  }

  // Data with safe defaults
  const remarks = quotation?.remarks || ''
  const laborItems = Array.isArray(quotation?.laborItems) ? quotation.laborItems : []
  const materialItems = Array.isArray(quotation?.materialItems) ? quotation.materialItems : []
  const serviceItems = Array.isArray(quotation?.serviceItems) ? quotation.serviceItems : []
  const contingencyItems = Array.isArray(quotation?.contingencyItems) ? quotation.contingencyItems : []
  const taxes = Array.isArray(quotation?.taxes) ? quotation.taxes : []

  // Compute fallbacks but prefer stored totals if present
  const computedSubtotal =
    laborItems.reduce((s, it) => s + (Number(it.total) || (Number(it.hours || 0) * Number(it.rate || 0))), 0) +
    materialItems.reduce((s, it) => s + (Number(it.total) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0) +
    serviceItems.reduce((s, it) => s + (Number(it.cost) || 0), 0)
  const computedContingency = contingencyItems.reduce((s, it) => s + (Number(it.amount) || 0), 0)
  const computedTax = taxes.reduce((s, it) => s + (Number(it.amount) || 0), 0)

  const subtotal = Number(quotation?.subtotal ?? computedSubtotal)
  const totalContingency = Number(quotation?.totalContingency ?? computedContingency)
  const totalTax = Number(quotation?.totalTax ?? computedTax)
  const grandTotal = Number(quotation?.grandTotal ?? (subtotal + totalContingency + totalTax))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[#FFF8E8] w-full max-w-5xl rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#AAB396] bg-[#F7EED3]">
          <h3 className="text-lg font-semibold text-[#674636]">View Quotation</h3>
          <button onClick={onClose} className="text-[#674636] hover:text-[#AAB396]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Header: meta and remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F7EED3] rounded p-3 border border-[#AAB396] text-[#674636]">
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Quotation ID:</span> {quotation?._id}</div>
                <div><span className="font-medium">Project:</span> {getProjectDisplay(quotation)}</div>
                <div><span className="font-medium">Estimate Version:</span> {quotation?.estimateVersion}</div>
                <div><span className="font-medium">Quotation Version:</span> {quotation?.version}</div>
                <div><span className="font-medium">Status:</span> {quotation?.status}</div>
                {quotation?.createdBy && (
                  <div><span className="font-medium">Created By:</span> {getUserDisplay(quotation.createdBy)}</div>
                )}
                {quotation?.updatedAt && (
                  <div><span className="font-medium">Updated:</span> {new Date(quotation.updatedAt).toLocaleString()}</div>
                )}
              </div>
            </div>
            <div className="bg-[#F7EED3] rounded p-3 border border-[#AAB396] text-[#674636]">
              <label className="text-sm font-medium block mb-1">Remarks</label>
              <textarea
                disabled
                readOnly
                className="w-full text-sm border border-[#AAB396] rounded bg-[#FFF8E8] p-2"
                value={remarks}
              />
            </div>
          </div>


          {/* Line Items (form-like read-only) */}
          <h4 className="text-sm font-medium text-[#674636] mb-2">Line Items</h4>
          <div className="bg-[#F7EED3] p-4 rounded-md mb-6 text-[#674636]">
            {/* Labor */}
            <div className="mb-4">
              <div className="font-semibold mb-2">Labor</div>
              {laborItems.length === 0 && <div className="text-sm opacity-70">—</div>}
              {laborItems.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <input disabled readOnly className="border border-[#AAB396] rounded px-2 py-1 text-sm flex-1 bg-[#FFF8E8]" value={it.task ?? ''} />
                  <input disabled readOnly type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-20 bg-[#FFF8E8]" value={it.hours ?? 0} />
                  <input disabled readOnly type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-24 bg-[#FFF8E8]" value={it.rate ?? 0} />
                  <span className="text-xs">{fmtMoney(it.total ?? (Number(it.hours||0)*Number(it.rate||0)))}</span>
                </div>
              ))}
            </div>

            {/* Materials */}
            <div className="mb-4">
              <div className="font-semibold mb-2">Materials</div>
              {materialItems.length === 0 && <div className="text-sm opacity-70">—</div>}
              {materialItems.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <input disabled readOnly className="border border-[#AAB396] rounded px-2 py-1 text-sm flex-1 bg-[#FFF8E8]" value={it.description ?? ''} />
                  <input disabled readOnly type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-20 bg-[#FFF8E8]" value={it.quantity ?? 0} />
                  <input disabled readOnly type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-24 bg-[#FFF8E8]" value={it.unitPrice ?? 0} />
                  <span className="text-xs">{fmtMoney(it.total ?? (Number(it.quantity||0)*Number(it.unitPrice||0)))}</span>
                </div>
              ))}
            </div>

            {/* Services */}
            <div className="mb-4">
              <div className="font-semibold mb-2">Services</div>
              {serviceItems.length === 0 && <div className="text-sm opacity-70">—</div>}
              {serviceItems.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <input disabled readOnly className="border border-[#AAB396] rounded px-2 py-1 text-sm flex-1 bg-[#FFF8E8]" value={it.service ?? ''} />
                  <input disabled readOnly type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-24 bg-[#FFF8E8]" value={it.cost ?? 0} />
                </div>
              ))}
            </div>

            {/* Contingency */}
            <div className="mb-4">
              <div className="font-semibold mb-2">Contingency</div>
              {contingencyItems.length === 0 && <div className="text-sm opacity-70">—</div>}
              {contingencyItems.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <input disabled readOnly className="border border-[#AAB396] rounded px-2 py-1 text-sm flex-1 bg-[#FFF8E8]" value={it.description ?? ''} />
                  <input disabled readOnly type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-24 bg-[#FFF8E8]" value={it.amount ?? 0} />
                </div>
              ))}
            </div>

            {/* Taxes */}
            <div>
              <div className="font-semibold mb-2">Taxes</div>
              {taxes.length === 0 && <div className="text-sm opacity-70">—</div>}
              {taxes.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <input disabled readOnly className="border border-[#AAB396] rounded px-2 py-1 text-sm flex-1 bg-[#FFF8E8]" value={it.description ?? ''} />
                  <input disabled readOnly type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-16 bg-[#FFF8E8]" value={it.percentage ?? 0} />
                  <span className="text-xs">{fmtMoney(it.amount ?? 0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals (moved below line items) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[{label:'Subtotal',value:subtotal},{label:'Contingency',value:totalContingency},{label:'Tax',value:totalTax},{label:'Grand Total',value:grandTotal}].map((c, i) => (
              <div key={i} className="bg-[#F7EED3] rounded p-3 border border-[#AAB396] text-[#674636]">
                <div className="text-xs opacity-80">{c.label}</div>
                <div className="font-semibold">{fmtMoney(c.value)}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-[#FFF8E8]"
            >
              Close
            </button>
            {quotation?.fileUrl && (
              <a
                href={/^https?:\/\//i.test(quotation.fileUrl) ? quotation.fileUrl : `/${quotation.fileUrl.startsWith('/') ? quotation.fileUrl.slice(1) : quotation.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#674636] border border-transparent rounded-md text-sm font-medium text-[#FFF8E8] hover:bg-[#AAB396]"
              >
                <Download size={16} className="inline mr-2" /> Download PDF
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
