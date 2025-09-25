import React, { useState } from 'react'
import { X, Upload } from 'lucide-react'

export const AddExpenseModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    projectId: '',
    description: '',
    category: '',
    amount: '',
    proof: null,
  })


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'proof') {
      setFormData((prev) => ({ ...prev, proof: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('projectId', formData.projectId);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('amount', formData.amount);
    if (formData.proof) data.append('proof', formData.proof);
    // createdBy is set automatically on backend
    await fetch('/api/expenses', {
      method: 'POST',
      body: data
    });
    onClose();
  };

  // Model categories
  const categories = ['Labor', 'Procurement', 'Transport', 'Misc'];

  // TODO: Replace with real project list from backend
  const projects = [
    { id: '1', name: 'Project Alpha' },
    { id: '2', name: 'Project Beta' },
    { id: '3', name: 'Project Gamma' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Add New Expense</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
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
                  <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    id="projectId"
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              {/* Right column */}
              <div>
                <div className="mb-4">
                  <label htmlFor="proof" className="block text-sm font-medium text-gray-700 mb-1">Proof (Receipt) *</label>
                  <input
                    type="file"
                    id="proof"
                    name="proof"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  {formData.proof && <div className="text-xs text-gray-500 mt-1">Selected: {formData.proof.name}</div>}
                </div>
              </div>
            </div>


            {/* Footer buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
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
