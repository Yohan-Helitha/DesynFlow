import React, { useState } from 'react'
import { X } from 'lucide-react'

export const GenerateEstimateModal = ({ inspection, onClose }) => {
  const [distance, setDistance] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')

  // Mock client details
  const clientDetails = {
    name: inspection.clientName,
    email: 'client@example.com',
    phone: '555-123-4567',
  }

  // Mock site details
  const siteDetails = {
    location: inspection.siteLocation,
    propertyType: inspection.propertyType,
    floors: 2,
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would save the estimate to your backend
    console.log('Saving estimate:', {
      inspectionId: inspection.id,
      distance,
      estimatedCost,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Generate Inspection Estimate</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Client Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm mb-1">
                  <span className="font-medium">Name:</span>{' '}
                  {clientDetails.name}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Email:</span>{' '}
                  {clientDetails.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span>{' '}
                  {clientDetails.phone}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Site Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm mb-1">
                  <span className="font-medium">Location:</span>{' '}
                  {siteDetails.location}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Property Type:</span>{' '}
                  {siteDetails.propertyType}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Floors:</span>{' '}
                  {siteDetails.floors}
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="distance"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Distance (km)
              </label>
              <input
                type="number"
                id="distance"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                min="0"
                step="0.1"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="estimatedCost"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estimated Cost ($)
              </label>
              <input
                type="number"
                id="estimatedCost"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>
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
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Save Estimate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
