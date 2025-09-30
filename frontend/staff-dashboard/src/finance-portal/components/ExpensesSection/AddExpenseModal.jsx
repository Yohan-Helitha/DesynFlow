import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export const AddExpenseModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    projectId: '',
    description: '',
    category: '',
    amount: '',
    proof: null,
  })

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'proof') {
      setFormData((prev) => ({ ...prev, proof: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('projectId', formData.projectId)
    data.append('description', formData.description)
    data.append('category', formData.category)
    data.append('amount', formData.amount)
    if (formData.proof) data.append('proof', formData.proof)

    try {
      const res = await fetch('/api/expenses', { method: 'POST', body: data })
      const json = await res.json().catch(() => ({}))
      const created = json?.expense || json // controller returns { expense } on success
      if (res.ok && created) {
        // Optimistically inform parent so it can prepend the new expense
        onCreated && onCreated(created)
      }
    } finally {
      onClose()
    }
  }

  const categories = ['Labor', 'Procurement', 'Transport', 'Misc']

  const [projects, setProjects] = useState([])

  useEffect(() => {
    // Fetch projects from backend
    fetch('/api/projects')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setProjects(data)
        else setProjects([])
      })
      .catch(() => setProjects([]))
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#AAB396]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396] bg-[#F7EED3]">
          <h3 className="text-lg font-semibold text-[#674636]">Add New Expense</h3>
          <button
            onClick={onClose}
            className="text-[#674636] hover:text-[#AAB396]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left column */}
              <div>
                <div className="mb-4">
                  <label htmlFor="projectId" className="block text-sm font-medium text-[#674636] mb-1">Project *</label>
                  <input
                    type="text"
                    id="projectId"
                    name="projectId"
                    list="projectId-options"
                    value={formData.projectId}
                    onChange={handleChange}
                    placeholder="Type or select a project ID"
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AAB396] focus:border-transparent bg-white"
                    required
                  />
                  <datalist id="projectId-options">
                    {projects.map((project) => {
                      const id = project.projectId || project._id;
                      return (
                        <option key={id} value={id} />
                      );
                    })}
                  </datalist>
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-[#674636] mb-1">Description *</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AAB396] focus:border-transparent bg-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-medium text-[#674636] mb-1">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AAB396] focus:border-transparent bg-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-[#674636] mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AAB396] focus:border-transparent bg-white"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Right column */}
              <div>
                <div className="mb-4">
                  <label htmlFor="proof" className="block text-sm font-medium text-[#674636] mb-1">Proof (Receipt) *</label>
                  <input
                    type="file"
                    id="proof"
                    name="proof"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AAB396] focus:border-transparent bg-white"
                    required
                  />
                  {formData.proof && (
                    <div className="text-xs text-[#674636] mt-1">
                      Selected: {formData.proof.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#F7EED3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#674636] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#AAB396]"
              >
                Save Expense
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
