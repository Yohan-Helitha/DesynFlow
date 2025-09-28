import React, { useState } from 'react';
import { X } from 'lucide-react';

export const AddWarrantyModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    startDate: '',
    duration: '12',
    type: 'Standard',
    coverage: 'Materials and Workmanship',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting warranty:', formData);
    onClose();
  };

  const calculateEndDate = () => {
    if (!formData.startDate) return '';
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + parseInt(formData.duration));
    return endDate.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396] bg-[#F7EED3]">
          <h3 className="text-lg font-medium text-[#674636]">
            Add New Warranty
          </h3>
          <button
            onClick={onClose}
            className="text-[#AAB396] hover:text-[#674636]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Project Details */}
              <div>
                <h4 className="text-sm font-medium text-[#AAB396] mb-4">
                  Project Details
                </h4>
                <div className="mb-4">
                  <label
                    htmlFor="projectId"
                    className="block text-sm font-medium text-[#674636] mb-1"
                  >
                    Project ID *
                  </label>
                  <input
                    type="text"
                    id="projectId"
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium text-[#674636] mb-1"
                  >
                    Project Name *
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                    required
                  />
                </div>

                <h4 className="text-sm font-medium text-[#AAB396] mt-6 mb-4">
                  Warranty Details
                </h4>
                <div className="mb-4">
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-[#674636] mb-1"
                  >
                    Warranty Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                    required
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="coverage"
                    className="block text-sm font-medium text-[#674636] mb-1"
                  >
                    Coverage *
                  </label>
                  <select
                    id="coverage"
                    name="coverage"
                    value={formData.coverage}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                    required
                  >
                    <option value="Materials and Workmanship">
                      Materials and Workmanship
                    </option>
                    <option value="Limited Coverage">Limited Coverage</option>
                    <option value="Full Coverage">Full Coverage</option>
                  </select>
                </div>
              </div>

              {/* Client Details */}
              <div>
                <h4 className="text-sm font-medium text-[#AAB396] mb-4">
                  Client Details
                </h4>
                <div className="mb-4">
                  <label
                    htmlFor="clientName"
                    className="block text-sm font-medium text-[#674636] mb-1"
                  >
                    Client Name *
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="clientEmail"
                    className="block text-sm font-medium text-[#674636] mb-1"
                  >
                    Client Email *
                  </label>
                  <input
                    type="email"
                    id="clientEmail"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="clientPhone"
                    className="block text-sm font-medium text-[#674636] mb-1"
                  >
                    Client Phone *
                  </label>
                  <input
                    type="tel"
                    id="clientPhone"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                    required
                  />
                </div>

                <h4 className="text-sm font-medium text-[#AAB396] mt-6 mb-4">
                  Warranty Period
                </h4>
                <div className="mb-4">
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-[#674636] mb-1"
                  >
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-[#674636] mb-1"
                  >
                    Duration (months) *
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                    required
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months (1 year)</option>
                    <option value="24">24 months (2 years)</option>
                    <option value="36">36 months (3 years)</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#674636] mb-1">
                    End Date (calculated)
                  </label>
                  <input
                    type="text"
                    value={calculateEndDate()}
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 bg-[#F7EED3]"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-[#674636] mb-1"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                placeholder="Add any additional details about this warranty..."
              ></textarea>
            </div>

            {/* Actions */}
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
                className="px-4 py-2 bg-[#674636] border border-transparent rounded-md text-sm font-medium text-[#FFF8E8] hover:bg-[#AAB396]"
              >
                Create Warranty
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
