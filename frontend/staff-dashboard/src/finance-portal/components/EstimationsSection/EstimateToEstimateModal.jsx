import React, { useState, useEffect } from 'react';

export const EstimateToEstimateModal = ({ estimation, onClose, onCreate }) => {
  if (!estimation) return null;

  const [materialCost, setMaterialCost] = useState(Number(estimation.materialCost) || 0);
  const [laborCost, setLaborCost] = useState(Number(estimation.laborCost) || 0);
  const [serviceCost, setServiceCost] = useState(Number(estimation.serviceCost) || 0);
  const [contingencyCost, setContingencyCost] = useState(Number(estimation.contingencyCost) || 0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const total =
      Number(materialCost || 0) +
      Number(laborCost || 0) +
      Number(serviceCost || 0) +
      Number(contingencyCost || 0);
    setTotalCost(total);
  }, [materialCost, laborCost, serviceCost, contingencyCost]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-[#FFF8E8] p-6 rounded-md shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <h2 className="text-xl font-semibold mb-4 text-[#674636]">Cost Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm border border-[#AAB396] min-w-[320px]">
          <thead>
            <tr className="bg-[#F7EED3]">
              <th className="border border-[#AAB396] px-2 py-1 text-left text-[#674636]">Item</th>
              <th className="border border-[#AAB396] px-2 py-1 text-left text-[#674636]">Cost ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#AAB396] px-2 py-1 text-[#674636]">Materials</td>
              <td className="border border-[#AAB396] px-2 py-1">
                <input
                  type="number"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(Number(e.target.value || 0))}
                  className="w-full border border-[#AAB396] px-1 py-0.5 rounded bg-white text-[#674636]"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-[#AAB396] px-2 py-1 text-[#674636]">Labor Cost</td>
              <td className="border border-[#AAB396] px-2 py-1">
                <input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value || 0))}
                  className="w-full border border-[#AAB396] px-1 py-0.5 rounded bg-white text-[#674636]"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-[#AAB396] px-2 py-1 text-[#674636]">Service Cost</td>
              <td className="border border-[#AAB396] px-2 py-1">
                <input
                  type="number"
                  value={serviceCost}
                  onChange={(e) => setServiceCost(Number(e.target.value || 0))}
                  className="w-full border border-[#AAB396] px-1 py-0.5 rounded bg-white text-[#674636]"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-[#AAB396] px-2 py-1 text-[#674636]">Contingency Cost</td>
              <td className="border border-[#AAB396] px-2 py-1">
                <input
                  type="number"
                  value={contingencyCost}
                  onChange={(e) => setContingencyCost(Number(e.target.value || 0))}
                  className="w-full border border-[#AAB396] px-1 py-0.5 rounded bg-white text-[#674636]"
                />
              </td>
            </tr>
            <tr className="font-semibold bg-[#F7EED3]">
              <td className="border border-[#AAB396] px-2 py-1 text-[#674636]">Total Cost</td>
              <td className="border border-[#AAB396] px-2 py-1 text-[#674636]">{totalCost.toLocaleString()}</td>
            </tr>
          </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end mt-6 space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F7EED3] text-[#674636] rounded-md hover:bg-[#AAB396]"
          >
            Close
          </button>
          <button
            onClick={() =>
              onCreate({ materialCost, laborCost, serviceCost, contingencyCost, totalCost })
            }
            className="px-4 py-2 bg-[#674636] text-[#FFF8E8] rounded-md hover:bg-[#AAB396]"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
