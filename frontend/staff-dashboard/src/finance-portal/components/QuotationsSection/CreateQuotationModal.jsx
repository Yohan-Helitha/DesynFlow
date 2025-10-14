import React, { useState, useEffect } from 'react'
import { X, Plus, Trash } from 'lucide-react'
import { safeFetchJson } from '../../utils/safeFetch'

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
      console.log('[CreateQuotationModal] Creating quotation with:', {
        projectId: formData.projectId,
        estimateVersion: formData.estimateVersion,
        itemCounts: { labor: laborItems.length, material: materialItems.length }
      });

      const created = await safeFetchJson('/api/quotations', {
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

      console.log('[CreateQuotationModal] Quotation created successfully:', created);
      
      if (onSubmit) onSubmit(created)
      onClose && onClose()
    } catch (err) {
      console.error('[CreateQuotationModal] Error creating quotation:', err);
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
        const data = await safeFetchJson(`/api/quotations/project/${formData.projectId}/next-version?estimateVersion=${formData.estimateVersion}`)
        setFormData(f => ({ ...f, version: data?.nextVersion || 1 }));
      } catch (e) {
        setFormData(f => ({ ...f, version: f.version || 1 }));
      }
    }
    fetchNext();
  }, [formData.projectId, formData.estimateVersion]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396] bg-[#F7EED3]">
          <h3 className="text-lg font-semibold text-[#674636]">Create Quotation</h3>
          <button onClick={onClose} className="text-[#AAB396] hover:text-[#674636]">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-semibold text-[#AAB396] mb-2">Basic Information</h4>
            <div className="bg-[#F7EED3] p-4 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#AAB396]">
              <div>
                <label className="block text-xs font-medium text-[#AAB396]">Project ID</label>
                <input
                  type="text"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full border border-[#AAB396] bg-[#F7EED3] cursor-not-allowed rounded-md px-2 py-1 text-sm text-[#674636]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#AAB396]">Estimate Version</label>
                <input
                  type="number"
                  name="estimateVersion"
                  value={formData.estimateVersion}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full border border-[#AAB396] bg-[#F7EED3] cursor-not-allowed rounded-md px-2 py-1 text-sm text-[#674636]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#AAB396]">Quotation Version</label>
                <input
                  type="number"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  readOnly
                  className="mt-1 block w-full border border-[#AAB396] bg-[#F7EED3] cursor-not-allowed rounded-md px-2 py-1 text-sm text-[#674636]"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <h4 className="text-sm font-semibold text-[#AAB396] mb-2">Remarks</h4>
            <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8] focus:outline-none focus:ring-1 focus:ring-[#674636]"
              />
            </div>
          </div>

          {/* Labor Items */}
          <div>
            <h4 className="text-sm font-semibold text-[#AAB396] mb-2">Labor Cost</h4>
            <div className="bg-[#F7EED3] p-4 rounded-md space-y-2 border border-[#AAB396]">
              {formData.laborItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-end">
                  <div className="flex-1 min-w-[10rem] flex flex-col">
                    <label htmlFor={`labor-task-${idx}`} className="text-[11px] text-[#AAB396]">Task</label>
                    <input
                      id={`labor-task-${idx}`}
                      type="text"
                      placeholder="Task"
                      aria-label="Labor Task"
                      value={item.task}
                      onChange={e => {
                        const copy = [...formData.laborItems];
                        copy[idx].task = e.target.value;
                        setFormData({ ...formData, laborItems: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <div className="w-24 flex flex-col">
                    <label htmlFor={`labor-hours-${idx}`} className="text-[11px] text-[#AAB396]">Hours</label>
                    <input
                      id={`labor-hours-${idx}`}
                      type="number"
                      placeholder="Hours"
                      value={item.hours}
                      min={0}
                      aria-label="Labor Hours"
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value));
                        const copy = [...formData.laborItems];
                        copy[idx].hours = val;
                        copy[idx].total = copy[idx].hours * copy[idx].rate;
                        setFormData({ ...formData, laborItems: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <div className="w-24 flex flex-col">
                    <label htmlFor={`labor-rate-${idx}`} className="text-[11px] text-[#AAB396]">Rate</label>
                    <input
                      id={`labor-rate-${idx}`}
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      min={0}
                      aria-label="Labor Rate"
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value));
                        const copy = [...formData.laborItems];
                        copy[idx].rate = val;
                        copy[idx].total = copy[idx].hours * copy[idx].rate;
                        setFormData({ ...formData, laborItems: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#AAB396]">Total</span>
                    <span className="text-sm text-[#674636] px-2">{item.total || 0}</span>
                  </div>
                  <button type="button" onClick={() => removeItem('laborItems', idx)} className="p-1 hover:bg-red-100 rounded self-center">
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('laborItems', { task: '', hours: 0, rate: 0, total: 0 })}
                className="flex items-center text-xs text-[#674636] hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Labor Item
              </button>
            </div>
          </div>

          {/* Material Items */}
          <div>
            <h4 className="text-sm font-semibold text-[#AAB396] mb-2">Material Cost</h4>
            <div className="bg-[#F7EED3] p-4 rounded-md space-y-2 border border-[#AAB396]">
              {formData.materialItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-end">
                  <div className="w-40 flex flex-col">
                    <label htmlFor={`material-id-${idx}`} className="text-[11px] text-[#AAB396]">Material</label>
                    <select
                      id={`material-id-${idx}`}
                      value={item.materialId}
                      aria-label="Material"
                      onChange={e => {
                        const copy = [...formData.materialItems];
                        const selectedMaterial = materials.find(m => m._id === e.target.value);
                        copy[idx].materialId = e.target.value;
                        if (selectedMaterial) {
                          copy[idx].unitPrice = selectedMaterial.unitPrice || 0;
                          copy[idx].description = selectedMaterial.materialName;
                          copy[idx].total = (copy[idx].quantity || 0) * (selectedMaterial.unitPrice || 0);
                        } else {
                          copy[idx].unitPrice = 0;
                          copy[idx].description = '';
                          copy[idx].total = 0;
                        }
                        setFormData({ ...formData, materialItems: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    >
                      <option value="">Select Material</option>
                      {materials.map(m => (
                        <option key={m._id} value={m._id}>{m.materialName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[10rem] flex flex-col">
                    <label htmlFor={`material-desc-${idx}`} className="text-[11px] text-[#AAB396]">Description</label>
                    <input
                      id={`material-desc-${idx}`}
                      type="text"
                      placeholder="Description"
                      aria-label="Material Description"
                      value={item.description}
                      onChange={e => {
                        const copy = [...formData.materialItems];
                        copy[idx].description = e.target.value;
                        setFormData({ ...formData, materialItems: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <div className="w-20 flex flex-col">
                    <label htmlFor={`material-qty-${idx}`} className="text-[11px] text-[#AAB396]">Qty</label>
                    <input
                      id={`material-qty-${idx}`}
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      min={0}
                      aria-label="Material Quantity"
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value));
                        const copy = [...formData.materialItems];
                        copy[idx].quantity = val;
                        copy[idx].total = val * (copy[idx].unitPrice || 0);
                        setFormData({ ...formData, materialItems: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <div className="w-24 flex flex-col">
                    <label htmlFor={`material-unitPrice-${idx}`} className="text-[11px] text-[#AAB396]">Unit Price</label>
                    <input
                      id={`material-unitPrice-${idx}`}
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      min={0}
                      aria-label="Material Unit Price"
                      readOnly
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8] cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#AAB396]">Line Total</span>
                    <span className="text-sm text-[#674636] px-2">{(item.quantity || 0) * (item.unitPrice || 0)}</span>
                  </div>
                  <button type="button" onClick={() => removeItem('materialItems', idx)} className="p-1 hover:bg-red-100 rounded self-center">
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('materialItems', { materialId: '', description: '', quantity: 0, unitPrice: 0, total: 0 })}
                className="flex items-center text-xs text-[#674636] hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Material Item
              </button>
            </div>
          </div>

          {/* Service Items */}
          <div>
            <h4 className="text-sm font-semibold text-[#AAB396] mb-2">Service Cost</h4>
            <div className="bg-[#F7EED3] p-4 rounded-md space-y-2 border border-[#AAB396]">
              {formData.serviceItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-end">
                  <div className="flex-1 min-w-[10rem] flex flex-col">
                    <label htmlFor={`service-name-${idx}`} className="text-[11px] text-[#AAB396]">Service</label>
                    <input
                      id={`service-name-${idx}`}
                      type="text"
                      placeholder="Service"
                      value={item.service}
                      aria-label="Service Name"
                      onChange={e => {
                        const copy = [...formData.serviceItems];
                        copy[idx].service = e.target.value;
                        setFormData({ ...formData, serviceItems: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <div className="w-24 flex flex-col">
                    <label htmlFor={`service-cost-${idx}`} className="text-[11px] text-[#AAB396]">Cost</label>
                    <input
                      id={`service-cost-${idx}`}
                      type="number"
                      placeholder="Cost"
                      value={item.cost}
                      min={0}
                      aria-label="Service Cost"
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value));
                        const copy = [...formData.serviceItems];
                        copy[idx].cost = val;
                        setFormData({ ...formData, serviceItems: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <button type="button" onClick={() => removeItem('serviceItems', idx)} className="p-1 hover:bg-red-100 rounded self-center">
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('serviceItems', { service: '', cost: 0 })}
                className="flex items-center text-xs text-[#674636] hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Service Item
              </button>
            </div>
          </div>

          {/* Contingency Items */}
          <div>
            <h4 className="text-sm font-semibold text-[#AAB396] mb-2">Contingency Cost</h4>
            <div className="bg-[#F7EED3] p-4 rounded-md space-y-2 border border-[#AAB396]">
              {formData.contingencyItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-end">
                  <div className="flex-1 min-w-[10rem] flex flex-col">
                    <label htmlFor={`cont-desc-${idx}`} className="text-[11px] text-[#AAB396]">Description</label>
                    <input
                      id={`cont-desc-${idx}`}
                      type="text"
                      placeholder="Description"
                      aria-label="Contingency Description"
                      value={item.description}
                      onChange={e => {
                        const copy = [...formData.contingencyItems];
                        copy[idx].description = e.target.value;
                        setFormData({ ...formData, contingencyItems: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <div className="w-24 flex flex-col">
                    <label htmlFor={`cont-amount-${idx}`} className="text-[11px] text-[#AAB396]">Amount</label>
                    <input
                      id={`cont-amount-${idx}`}
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      min={0}
                      aria-label="Contingency Amount"
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value));
                        const copy = [...formData.contingencyItems];
                        copy[idx].amount = val;
                        setFormData({ ...formData, contingencyItems: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <button type="button" onClick={() => removeItem('contingencyItems', idx)} className="p-1 hover:bg-red-100 rounded self-center">
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('contingencyItems', { description: '', amount: 0 })}
                className="flex items-center text-xs text-[#674636] hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Contingency Item
              </button>
            </div>
          </div>

          {/* Taxes */}
          <div>
            <h4 className="text-sm font-semibold text-[#AAB396] mb-2">Taxes</h4>
            <div className="bg-[#F7EED3] p-4 rounded-md space-y-2 border border-[#AAB396]">
              {formData.taxes.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-end">
                  <div className="flex-1 min-w-[10rem] flex flex-col">
                    <label htmlFor={`tax-desc-${idx}`} className="text-[11px] text-[#AAB396]">Description</label>
                    <input
                      id={`tax-desc-${idx}`}
                      type="text"
                      placeholder="Description"
                      aria-label="Tax Description"
                      value={item.description}
                      onChange={e => {
                        const copy = [...formData.taxes];
                        copy[idx].description = e.target.value;
                        setFormData({ ...formData, taxes: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <div className="w-20 flex flex-col">
                    <label htmlFor={`tax-perc-${idx}`} className="text-[11px] text-[#AAB396]">%</label>
                    <input
                      id={`tax-perc-${idx}`}
                      type="number"
                      placeholder="%"
                      value={item.percentage}
                      min={0}
                      aria-label="Tax Percentage"
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value));
                        const copy = [...formData.taxes];
                        copy[idx].percentage = val;
                        const newSubtotal = computeSubtotal();
                        copy[idx].amount = (newSubtotal * val) / 100;
                        setFormData({ ...formData, taxes: copy });
                      }}
                      className="border border-[#AAB396] rounded-md px-2 py-1 text-sm text-[#674636] bg-[#FFF8E8]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#AAB396]">Amount</span>
                    <span className="text-sm text-[#674636] px-2">{item.amount || 0}</span>
                  </div>
                  <button type="button" onClick={() => removeItem('taxes', idx)} className="p-1 hover:bg-red-100 rounded self-center">
                    <Trash size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('taxes', { description: '', percentage: 0, amount: 0 })}
                className="flex items-center text-xs text-[#674636] hover:underline"
              >
                <Plus size={14} className="mr-1" /> Add Tax
              </button>
            </div>
          </div>

          {/* Totals Summary */}
          <div>
            <h4 className="text-sm font-semibold text-[#AAB396] mb-2">Summary</h4>
            <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col"><span className="text-[#AAB396]">Subtotal</span><span className="font-semibold text-[#674636]">${subtotal.toLocaleString()}</span></div>
                <div className="flex flex-col"><span className="text-[#AAB396]">Contingency</span><span className="font-semibold text-[#674636]">${totalContingency.toLocaleString()}</span></div>
                <div className="flex flex-col"><span className="text-[#AAB396]">Tax</span><span className="font-semibold text-[#674636]">${totalTax.toLocaleString()}</span></div>
                <div className="flex flex-col"><span className="text-[#AAB396]">Grand Total</span><span className="font-bold text-[#674636]">${grandTotal.toLocaleString()}</span></div>
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
              className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#FFF8E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${submitting ? 'bg-[#AAB396] cursor-not-allowed' : 'bg-[#674636] hover:bg-[#AAB396]'}`}
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
