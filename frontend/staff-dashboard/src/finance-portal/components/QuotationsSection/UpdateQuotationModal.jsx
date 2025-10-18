import React, { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

// Editable modal for updating a quotation
const UpdateQuotationModal = ({ quotation, onClose, onSave }) => {
  const [editable, setEditable] = useState({
    laborItems: [...(quotation.laborItems || [])],
    materialItems: [...(quotation.materialItems || [])],
    serviceItems: [...(quotation.serviceItems || [])],
    contingencyItems: [...(quotation.contingencyItems || [])],
    taxes: [...(quotation.taxes || [])],
  })

  // Materials catalog for dropdown
  const [materials, setMaterials] = useState([])
  const [materialsError, setMaterialsError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/materials/priced')
        if (!res.ok) throw new Error(`Failed to load materials (${res.status})`)
        const data = await res.json()
        const sorted = (data || []).sort((a, b) => (a.materialName || '').localeCompare(b.materialName || ''))
        if (!cancelled) setMaterials(sorted)
      } catch (err) {
        if (!cancelled) setMaterialsError(err.message)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // If some items only have description but not materialId, try to backfill from catalog
  useEffect(() => {
    if (!materials?.length) return
    setEditable(prev => {
      const next = { ...prev }
      next.materialItems = (prev.materialItems || []).map(it => {
        const hasId = it.materialId && String(it.materialId).length > 0
        if (hasId || !it.description) return it
        const match = materials.find(m => (m.materialName || '').toLowerCase() === String(it.description).toLowerCase())
        if (!match) return it
        const q = Number(it.quantity || 0)
        const u = Number(it.unitPrice ?? match.unitPrice ?? 0)
        return { ...it, materialId: match._id, unitPrice: u, total: q * u }
      })
      return next
    })
  }, [materials])

  const subtotal =
    (editable.laborItems || []).reduce((s, it) => s + (Number(it.total) || (Number(it.hours || 0) * Number(it.rate || 0))), 0) +
    (editable.materialItems || []).reduce((s, it) => s + (Number(it.total) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0) +
    (editable.serviceItems || []).reduce((s, it) => s + (Number(it.cost) || 0), 0)
  const totalContingency = (editable.contingencyItems || []).reduce((s, it) => s + (Number(it.amount) || 0), 0)
  const totalTax = (editable.taxes || []).reduce((s, it) => s + (Number(it.amount) || 0), 0)
  const grandTotal = subtotal + totalContingency + totalTax

  const handleAddItem = (key, item) => {
    setEditable(prev => ({ ...prev, [key]: [...(prev[key] || []), item] }))
  }
  const handleRemoveItem = (key, idx) => {
    setEditable(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }))
  }
  const handleChangeItem = (key, idx, field, value) => {
    setEditable(prev => {
      const copy = [...prev[key]]
      copy[idx] = { ...copy[idx], [field]: value }
      if (key === 'laborItems') {
        const h = Number(copy[idx].hours || 0)
        const r = Number(copy[idx].rate || 0)
        copy[idx].total = h * r
      }
      if (key === 'materialItems') {
        const q = Number(copy[idx].quantity || 0)
        const u = Number(copy[idx].unitPrice || 0)
        copy[idx].total = q * u
      }
      return { ...prev, [key]: copy }
    })
  }

  // When a material is selected from dropdown
  const handleSelectMaterial = (idx, materialId) => {
    const mat = materials.find(m => String(m._id) === String(materialId))
    setEditable(prev => {
      const items = [...(prev.materialItems || [])]
      const current = { ...items[idx] }
      current.materialId = materialId
      if (mat) {
        current.description = mat.materialName
        // If there is a priced default, set it; otherwise keep current
        if (typeof mat.unitPrice === 'number') {
          current.unitPrice = mat.unitPrice
        }
      }
      const q = Number(current.quantity || 0)
      const u = Number(current.unitPrice || 0)
      current.total = q * u
      items[idx] = current
      return { ...prev, materialItems: items }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[#FFF8E8] w-full max-w-5xl rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#AAB396] bg-[#F7EED3]">
          <h3 className="text-lg font-semibold text-[#674636]">Update Quotation</h3>
          <button onClick={onClose} className="text-[#674636] hover:text-[#AAB396]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Header: meta */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-[#F7EED3] rounded p-3 border border-[#AAB396] text-[#674636]">
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Quotation ID:</span> {quotation._id}</div>
                <div><span className="font-medium">Project:</span> {typeof quotation.projectId === 'object' ? (quotation.projectId?.projectName || quotation.projectId?._id) : quotation.projectId}</div>
                <div><span className="font-medium">Estimate Version:</span> {quotation.estimateVersion}</div>
                <div><span className="font-medium">Quotation Version:</span> {quotation.version}</div>
                <div><span className="font-medium">Status:</span> {quotation.status}</div>
              </div>
            </div>
            {/* Remarks (read-only) */}
            {quotation?.remarks && (
              <div className="bg-[#F7EED3] rounded p-3 border border-[#AAB396] text-[#674636]">
                <div className="text-sm font-medium mb-1">Remarks</div>
                <textarea
                  className="w-full border border-[#AAB396] rounded px-2 py-1 text-sm bg-[#FFF8E8] text-[#674636]"
                  value={quotation.remarks}
                  readOnly
                  disabled
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Quick Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[{label:'Subtotal',value:subtotal},{label:'Contingency',value:totalContingency},{label:'Tax',value:totalTax},{label:'Grand Total',value:grandTotal}].map((c, i) => (
              <div key={i} className="bg-[#F7EED3] rounded p-3 border border-[#AAB396] text-[#674636]">
                <div className="text-xs opacity-80">{c.label}</div>
                <div className="font-semibold">LKR {Number(c.value || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Editable Line Items */}
          <h4 className="text-sm font-medium text-[#674636] mb-2">Edit Line Items</h4>
          <div className="bg-[#F7EED3] p-4 rounded-md mb-6">
            {/* Labor */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#674636]">Labor</span>
                <button className="text-xs text-[#674636] hover:underline" onClick={() => handleAddItem('laborItems', { task: '', hours: 0, rate: 0, total: 0 })}>Add</button>
              </div>
              {editable.laborItems.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <input className="border border-[#AAB396] rounded px-2 py-1 text-sm flex-1 bg-[#FFF8E8]" value={it.task} onChange={e => handleChangeItem('laborItems', idx, 'task', e.target.value)} placeholder="Task" />
                  <input type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-20 bg-[#FFF8E8]" value={it.hours} onChange={e => handleChangeItem('laborItems', idx, 'hours', Number(e.target.value))} placeholder="Hours" />
                  <input type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-24 bg-[#FFF8E8]" value={it.rate} onChange={e => handleChangeItem('laborItems', idx, 'rate', Number(e.target.value))} placeholder="Rate" />
                  <span className="text-xs text-[#674636]">{it.total || 0}</span>
                  <button className="text-xs text-red-600" onClick={() => handleRemoveItem('laborItems', idx)}>Remove</button>
                </div>
              ))}
            </div>

            {/* Materials */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#674636]">Materials</span>
                <button className="text-xs text-[#674636] hover:underline" onClick={() => handleAddItem('materialItems', { materialId: '', description: '', quantity: 0, unitPrice: 0, total: 0 })}>Add</button>
              </div>
              {editable.materialItems.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  {/* Material selector */}
                  <select
                    className="border border-[#AAB396] rounded px-2 py-1 text-sm flex-1 bg-[#FFF8E8]"
                    value={typeof it.materialId === 'object' ? (it.materialId?._id || '') : (it.materialId || '')}
                    onChange={e => handleSelectMaterial(idx, e.target.value)}
                  >
                    <option value="">Select material</option>
                    {materials.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.materialName}{typeof m.unitPrice === 'number' && m.unitPrice > 0 ? ` - LKR ${Number(m.unitPrice).toLocaleString()}` : ''}
                      </option>
                    ))}
                  </select>
                  <input type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-20 bg-[#FFF8E8]" value={it.quantity} onChange={e => handleChangeItem('materialItems', idx, 'quantity', Number(e.target.value))} placeholder="Qty" />
                  <input type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-24 bg-[#FFF8E8]" value={it.unitPrice} onChange={e => handleChangeItem('materialItems', idx, 'unitPrice', Number(e.target.value))} placeholder="Unit Price" />
                  <span className="text-xs text-[#674636]">{it.total || 0}</span>
                  <button className="text-xs text-red-600" onClick={() => handleRemoveItem('materialItems', idx)}>Remove</button>
                </div>
              ))}
              {materialsError && (
                <div className="text-xs text-red-600 mt-1">Failed to load materials: {materialsError}</div>
              )}
            </div>

            {/* Services */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#674636]">Services</span>
                <button className="text-xs text-[#674636] hover:underline" onClick={() => handleAddItem('serviceItems', { service: '', cost: 0 })}>Add</button>
              </div>
              {editable.serviceItems.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <input className="border border-[#AAB396] rounded px-2 py-1 text-sm flex-1 bg-[#FFF8E8]" value={it.service} onChange={e => handleChangeItem('serviceItems', idx, 'service', e.target.value)} placeholder="Service" />
                  <input type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-24 bg-[#FFF8E8]" value={it.cost} onChange={e => handleChangeItem('serviceItems', idx, 'cost', Number(e.target.value))} placeholder="Cost" />
                  <button className="text-xs text-red-600" onClick={() => handleRemoveItem('serviceItems', idx)}>Remove</button>
                </div>
              ))}
            </div>

            {/* Contingency */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#674636]">Contingency</span>
                <button className="text-xs text-[#674636] hover:underline" onClick={() => handleAddItem('contingencyItems', { description: '', amount: 0 })}>Add</button>
              </div>
              {editable.contingencyItems.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <input className="border border-[#AAB396] rounded px-2 py-1 text-sm flex-1 bg-[#FFF8E8]" value={it.description} onChange={e => handleChangeItem('contingencyItems', idx, 'description', e.target.value)} placeholder="Description" />
                  <input type="number" className="border border-[#AAB396] rounded px-2 py-1 text-sm w-24 bg-[#FFF8E8]" value={it.amount} onChange={e => handleChangeItem('contingencyItems', idx, 'amount', Number(e.target.value))} placeholder="Amount" />
                  <button className="text-xs text-red-600" onClick={() => handleRemoveItem('contingencyItems', idx)}>Remove</button>
                </div>
              ))}
            </div>

            {/* Taxes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#674636]">Taxes</span>
                <button className="text-xs text-[#674636] hover:underline" onClick={() => handleAddItem('taxes', { description: '', percentage: 0, amount: 0 })}>Add</button>
              </div>
              {editable.taxes.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-1">
                  <input className="border border-[#AAB396] rounded px-2 py-1 text-sm flex-1 bg-[#FFF8E8]" value={it.description} onChange={e => handleChangeItem('taxes', idx, 'description', e.target.value)} placeholder="Description" />
                  <input
                    type="number"
                    className="border border-[#AAB396] rounded px-2 py-1 text-sm w-16 bg-[#FFF8E8]"
                    value={it.percentage}
                    onChange={e => {
                      const val = Number(e.target.value)
                      handleChangeItem('taxes', idx, 'percentage', val)
                      const newSubtotal = subtotal
                      handleChangeItem('taxes', idx, 'amount', (newSubtotal * val) / 100)
                    }}
                    placeholder="%"
                  />
                  <span className="text-xs text-[#674636]">{it.amount || 0}</span>
                  <button className="text-xs text-red-600" onClick={() => handleRemoveItem('taxes', idx)}>Remove</button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-[#FFF8E8]"
            >
              Close
            </button>
            {onSave && (
              <button
                onClick={() => {
                  const payload = { ...quotation, ...editable }
                  onSave(payload)
                }}
                className="px-4 py-2 bg-[#674636] border border-transparent rounded-md text-sm font-medium text-[#FFF8E8] hover:bg-[#AAB396]"
              >
                Save Changes
              </button>
            )}
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

export default UpdateQuotationModal
