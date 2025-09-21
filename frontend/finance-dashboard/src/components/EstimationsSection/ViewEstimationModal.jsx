import React, { useState, useEffect } from 'react';

export const ViewEstimationModal = ({ estimation, onClose }) => {
  if (!estimation) return null;

  // State for cost breakdown
  const [materialCost, setMaterialCost] = useState(estimation.materialCost || 0);
  const [laborCost, setLaborCost] = useState(estimation.laborCost || 0);
  const [serviceCost, setServiceCost] = useState(estimation.serviceCost || 0);
  const [contingencyCost, setContingencyCost] = useState(estimation.contingencyCost || 0);
  const [totalCost, setTotalCost] = useState(0);

  // Calculate total whenever any cost changes
  useEffect(() => {
    const total = 
      Number(materialCost || 0) +
      Number(laborCost || 0) +
      Number(serviceCost || 0) +
      Number(contingencyCost || 0);
    setTotalCost(total);
  }, [materialCost, laborCost, serviceCost, contingencyCost]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Estimation Details</h2>

        {/* Project Info */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Project Information</h3>
          <p><span className="font-medium">Project ID:</span> {estimation.projectId}</p>
          <p><span className="font-medium">Version:</span> {estimation.version}</p>
        </div>

        {/* Cost Breakdown */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Cost Breakdown</h3>
          <table className="w-full text-sm border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Item</th>
                <th className="border px-2 py-1 text-left">Cost ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">Materials</td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(e.target.value)}
                    className="w-full border px-1 py-0.5 rounded"
                  />
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Labor</td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    className="w-full border px-1 py-0.5 rounded"
                  />
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Service</td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={serviceCost}
                    onChange={(e) => setServiceCost(e.target.value)}
                    className="w-full border px-1 py-0.5 rounded"
                  />
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Contingency</td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={contingencyCost}
                    onChange={(e) => setContingencyCost(e.target.value)}
                    className="w-full border px-1 py-0.5 rounded"
                  />
                </td>
              </tr>
              <tr className="font-semibold bg-gray-50">
                <td className="border px-2 py-1">Total</td>
                <td className="border px-2 py-1">{totalCost}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
