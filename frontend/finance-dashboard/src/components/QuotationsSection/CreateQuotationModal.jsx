import React, { useState, useEffect } from 'react'
import { X, Plus, Trash } from 'lucide-react'

// NOTE: This component was restyled to visually align with ViewQuotationModal while
// preserving editable form functionality. A derived totals summary section was added
// and inputs received consistent Tailwind classes.
export const QuotationFormModal = ({
  onClose,
  onSubmit,
  users = [],
  materials = [],
  projectId: incomingProjectId = '',
  estimateVersion: incomingEstimateVersion = '',
  version: incomingQuotationVersion = '',
  createdBy: incomingCreatedBy = null,
}) => {
  const [formData, setFormData] = useState({
    projectId: incomingProjectId,
    estimateVersion: incomingEstimateVersion,
    version: incomingQuotationVersion,
  // Removed: status/locked/user dispatch/file meta per latest requirements
  // Keeping remarks and line items only.
  remarks: '',
    laborItems: [],
    materialItems: [],
    serviceItems: [],
    contingencyItems: [],
    taxes: [],
    subtotal: 0,
    totalContingency: 0,
    totalTax: 0,
    grandTotal: 0,
  })

  // ---- Helpers ----
  // Handle input change (basic fields)
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'file'
          ? files[0]
          : value,
    })
  }

  // Add new line item
  const addItem = (field, newItem) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], newItem],
    })
  }

  // Remove line item
  const removeItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    })
  }

  const computeSubtotal = () =>
    formData.laborItems.reduce((sum, i) => sum + (i.total || 0), 0) +
    formData.materialItems.reduce((sum, i) => sum + (i.total || 0), 0) +
    formData.serviceItems.reduce((sum, i) => sum + (i.cost || 0), 0)

  const computeTotals = () => {
    const subtotal = computeSubtotal()
    const totalContingency = formData.contingencyItems.reduce((sum, i) => sum + (i.amount || 0), 0)
    const totalTax = formData.taxes.reduce((sum, i) => sum + (i.amount || 0), 0)
    const grandTotal = subtotal + totalContingency + totalTax
    return { subtotal, totalContingency, totalTax, grandTotal }
  }

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [validationWarning, setValidationWarning] = useState('')

  // Submit handler with backend POST
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setValidationWarning('')
    setSubmitting(true)
    const { subtotal, totalContingency, totalTax, grandTotal } = computeTotals()
    // Prune incomplete line items (avoid schema validation errors)
    const laborItems = formData.laborItems.filter(i => i.task && i.hours > 0 && i.rate > 0)
    const materialItems = formData.materialItems.filter(i => i.materialId && i.description && i.quantity > 0 && i.unitPrice > 0)
    const serviceItems = formData.serviceItems.filter(i => i.service && i.cost > 0)
    const contingencyItems = formData.contingencyItems.filter(i => i.description && i.amount > 0)
    const taxes = formData.taxes.filter(i => i.percentage > 0)

    if (
      laborItems.length === 0 &&
      materialItems.length === 0 &&
      serviceItems.length === 0 &&
      contingencyItems.length === 0 &&
      taxes.length === 0
    ) {
      setSubmitting(false)
      setValidationWarning('Add at least one valid line item before saving.')
      return
    }
    try {
      const resp = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: formData.projectId,
          estimateVersion: formData.estimateVersion,
          laborItems,
          materialItems,
          serviceItems,
          contingencyItems,
          taxes,
            remarks: formData.remarks,
          createdBy: incomingCreatedBy || undefined,
            // Backend calculates version & totals again for integrity, but we send ours for potential preview usage
            subtotal,
            totalContingency,
            totalTax,
            grandTotal
        })
      })
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create quotation')
      }
      const created = await resp.json()
      if (onSubmit) onSubmit(created)
      onClose && onClose()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const { subtotal, totalContingency, totalTax, grandTotal } = computeTotals()

  // Auto-fetch next quotation version when project/estimateVersion available
  useEffect(() => {
    async function fetchNext() {
      if (!formData.projectId || formData.estimateVersion === '' || formData.estimateVersion === null) return;
      try {
        const res = await fetch(`/api/quotations/project/${formData.projectId}/next-version?estimateVersion=${formData.estimateVersion}`);
        if (!res.ok) throw new Error('Failed to fetch next version');
        const data = await res.json();
        setFormData(f => ({ ...f, version: data.nextVersion }));
      } catch (e) {
        // fallback to 1 if error
        setFormData(f => ({ ...f, version: f.version || 1 }));
      }
    }
    fetchNext();
  }, [formData.projectId, formData.estimateVersion]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Create Quotation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information (IDs now read-only) */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h4>
            <div className="bg-gray-50 p-4 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600">Project ID</label>
                <input
                  type="text"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full border border-gray-200 bg-gray-100 cursor-not-allowed rounded-md px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Estimate Version</label>
                <input
                  type="number"
                  name="estimateVersion"
                  value={formData.estimateVersion}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full border border-gray-200 bg-gray-100 cursor-not-allowed rounded-md px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Quotation Version</label>
                <input
                  type="number"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full border border-gray-200 bg-gray-100 cursor-not-allowed rounded-md px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Remarks</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Labor Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Labor Items</h4>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              {formData.laborItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Task"
                    value={item.task}
                    onChange={e => {
                      const copy = [...formData.laborItems];
                      copy[idx].task = e.target.value;
                      setFormData({ ...formData, laborItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Hours"
                    value={item.hours}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const copy = [...formData.laborItems];
                      copy[idx].hours = val;
                      copy[idx].total = copy[idx].hours * copy[idx].rate;
                      setFormData({ ...formData, laborItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const copy = [...formData.laborItems];
                      copy[idx].rate = val;
                      copy[idx].total = copy[idx].hours * copy[idx].rate;
                      setFormData({ ...formData, laborItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24"
                  />
                  <span className="text-sm text-gray-600 px-2">{item.total || 0}</span>
                  <button type="button" onClick={() => removeItem('laborItems', idx)} className="p-1 hover:bg-red-50 rounded">
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('laborItems', { task: '', hours: 0, rate: 0, total: 0 })}
                className="flex items-center text-xs text-purple-600 hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Labor Item
              </button>
            </div>
          </div>

          {/* Material Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Material Items</h4>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              {formData.materialItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                  <select
                    value={item.materialId}
                    onChange={e => {
                      const copy = [...formData.materialItems];
                      copy[idx].materialId = e.target.value;
                      setFormData({ ...formData, materialItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-40"
                  >
                    <option value="">Select Material</option>
                    {materials.map(m => (
                      <option key={m._id} value={m._id}>{m.name || m.description}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={e => {
                      const copy = [...formData.materialItems];
                      copy[idx].description = e.target.value;
                      setFormData({ ...formData, materialItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const copy = [...formData.materialItems];
                      copy[idx].quantity = val;
                      copy[idx].total = copy[idx].quantity * copy[idx].unitPrice;
                      setFormData({ ...formData, materialItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-20"
                  />
                  <input
                    type="number"
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const copy = [...formData.materialItems];
                      copy[idx].unitPrice = val;
                      copy[idx].total = copy[idx].quantity * copy[idx].unitPrice;
                      setFormData({ ...formData, materialItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24"
                  />
                  <span className="text-sm text-gray-600 px-2">{item.total || 0}</span>
                  <button type="button" onClick={() => removeItem('materialItems', idx)} className="p-1 hover:bg-red-50 rounded">
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('materialItems', { materialId: '', description: '', quantity: 0, unitPrice: 0, total: 0 })}
                className="flex items-center text-xs text-purple-600 hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Material Item
              </button>
            </div>
          </div>

          {/* Service Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Service Items</h4>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              {formData.serviceItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Service"
                    value={item.service}
                    onChange={e => {
                      const copy = [...formData.serviceItems];
                      copy[idx].service = e.target.value;
                      setFormData({ ...formData, serviceItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Cost"
                    value={item.cost}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const copy = [...formData.serviceItems];
                      copy[idx].cost = val;
                      setFormData({ ...formData, serviceItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24"
                  />
                  <button type="button" onClick={() => removeItem('serviceItems', idx)} className="p-1 hover:bg-red-50 rounded">
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('serviceItems', { service: '', cost: 0 })}
                className="flex items-center text-xs text-purple-600 hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Service Item
              </button>
            </div>
          </div>

          {/* Contingency Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Contingency Items</h4>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              {formData.contingencyItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={e => {
                      const copy = [...formData.contingencyItems];
                      copy[idx].description = e.target.value;
                      setFormData({ ...formData, contingencyItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const copy = [...formData.contingencyItems];
                      copy[idx].amount = val;
                      setFormData({ ...formData, contingencyItems: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24"
                  />
                  <button type="button" onClick={() => removeItem('contingencyItems', idx)} className="p-1 hover:bg-red-50 rounded">
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('contingencyItems', { description: '', amount: 0 })}
                className="flex items-center text-xs text-purple-600 hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Contingency Item
              </button>
            </div>
          </div>

          {/* Taxes */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Taxes</h4>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              {formData.taxes.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={e => {
                      const copy = [...formData.taxes];
                      copy[idx].description = e.target.value;
                      setFormData({ ...formData, taxes: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1"
                  />
                  <input
                    type="number"
                    placeholder="%"
                    value={item.percentage}
                    onChange={e => {
                      const val = Number(e.target.value);
                      const copy = [...formData.taxes];
                      copy[idx].percentage = val;
                      const newSubtotal = computeSubtotal();
                      copy[idx].amount = (newSubtotal * val) / 100;
                      setFormData({ ...formData, taxes: copy });
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-20"
                  />
                  <span className="text-sm text-gray-600 px-2">{item.amount || 0}</span>
                  <button type="button" onClick={() => removeItem('taxes', idx)} className="p-1 hover:bg-red-50 rounded">
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('taxes', { description: '', percentage: 0, amount: 0 })}
                className="flex items-center text-xs text-purple-600 hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Tax
              </button>
            </div>
          </div>

          {/* Totals Summary */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Summary</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col"><span className="text-gray-500">Subtotal</span><span className="font-semibold">${subtotal.toLocaleString()}</span></div>
                <div className="flex flex-col"><span className="text-gray-500">Contingency</span><span className="font-semibold">${totalContingency.toLocaleString()}</span></div>
                <div className="flex flex-col"><span className="text-gray-500">Tax</span><span className="font-semibold">${totalTax.toLocaleString()}</span></div>
                <div className="flex flex-col"><span className="text-gray-500">Grand Total</span><span className="font-bold text-purple-600">${grandTotal.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-2">
            {(submitError || validationWarning) && (
              <div className="text-sm mr-auto self-center">
                {validationWarning && <div className="text-yellow-700">{validationWarning}</div>}
                {submitError && <div className="text-red-600">{submitError}</div>}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${submitting ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {submitting ? 'Saving...' : 'Save Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Backwards compatibility named export alias
export const CreateQuotationModal = QuotationFormModal
export default QuotationFormModal
