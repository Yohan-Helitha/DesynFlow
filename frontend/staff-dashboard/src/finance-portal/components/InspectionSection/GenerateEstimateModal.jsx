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
      // Calculate cost in LKR using fixed per-km rate
      // Per product spec / test guides: LKR 50 per km
      const RATE_PER_KM = 50;
      cost = Math.round(num * RATE_PER_KM);
    }
    setEstimatedCost(cost !== '' ? cost : '');
  };

  const handleGenerate = async () => {
    try {
  const requestId = inspection?._id || inspection?.inspectionRequestId || inspection?.id;
      if (!requestId) {
        throw new Error('Missing inspection request ID');
      }
      const res = await fetch(`/api/inspection-estimation/${requestId}/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distance: parseFloat(distance), estimatedCost: parseFloat(estimatedCost) })
      });
      if (!res.ok) throw new Error('Failed to generate estimate');
      if (onDataChanged) onDataChanged();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-[#674636]">Generate Estimate</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#674636]">Distance (km)</label>
            <input
              type="number"
              value={distance}
              onChange={handleDistanceChange}
              className="w-full mt-1 px-3 py-2 border border-[#AAB396] rounded-md bg-[#F7EED3] focus:outline-none focus:ring-2 focus:ring-[#674636]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#674636]">Estimated Cost (LKR)</label>
            <input
              type="number"
              value={estimatedCost}
              readOnly
              className="w-full mt-1 px-3 py-2 border border-[#AAB396] rounded-md bg-[#F7EED3] text-[#AAB396] cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F7EED3] text-[#674636] border border-[#AAB396] rounded-md hover:bg-[#AAB396] hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-[#674636] text-white rounded-md hover:bg-[#AAB396]"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};
