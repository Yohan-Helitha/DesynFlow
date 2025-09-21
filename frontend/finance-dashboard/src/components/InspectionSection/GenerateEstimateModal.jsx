import React, { useState } from 'react';

export const GenerateEstimateModal = ({ inspection, onClose, onDataChanged }) => {
  const [distance, setDistance] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');

  // Calculate estimated cost when distance changes
  const handleDistanceChange = (e) => {
    const value = e.target.value;
    setDistance(value);
    let cost = '';
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (num <= 50) {
        cost = num * 1;
      } else {
        cost = 50 * 1 + (num - 50) * 2;
      }
      cost = Math.round(cost * 100) / 100;
    }
    setEstimatedCost(cost !== '' ? cost : '');
  };

  const handleGenerate = async () => {
    // Send POST to backend
    try {
      const res = await fetch(`/api/inspection-estimation/${inspection.inspectionRequestId}/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distance: parseFloat(distance), estimatedCost: parseFloat(estimatedCost) })
      });
      if (!res.ok) throw new Error('Failed to generate estimate');
      // Refresh parent data
      if (onDataChanged) onDataChanged();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Generate Estimate</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Distance (km)</label>
            <input
              type="number"
              value={distance}
              onChange={handleDistanceChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Estimated Cost ($)</label>
            <input
              type="number"
              value={estimatedCost}
              readOnly
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};
