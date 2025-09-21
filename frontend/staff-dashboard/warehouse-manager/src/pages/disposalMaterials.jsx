import Navbar from "../component/navbar";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import { fetchDisposalMaterials, deleteDisposalMaterial } from "../services/FdisposalMaterialsService.js";

const DisposalMaterials = () => {
  const [disposals, setDisposals] = useState([]);
  const navigate = useNavigate();

  // Fetch all disposal records
  const getDisposals = async () => {
    try {
      const data = await fetchDisposalMaterials();
      setDisposals(data);
    } catch (err) {
      console.error("Failed to fetch disposal materials:", err);
    }
  };

  useEffect(() => {
    getDisposals();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      await deleteDisposalMaterial(id);
      setDisposals(disposals.filter((d) => d._id !== id));
      alert("Disposal record deleted successfully!");
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Failed to delete disposal record.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Disposal Materials</h1>
          <button
            className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/add-disposal-material")}
          >
            + Add Disposal
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Disposal ID</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Material Name</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Inventory Name</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Unit</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Requested By</th>
                <th className="border border-gray-300 px-4 py-2 w-48">Reason</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Approved By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs bg-white">
              {disposals.length > 0 ? (
                disposals.map((disposal) => (
                  <tr key={disposal._id}>
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                      <div className="flex items-center justify-center gap-6">
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => navigate(`/update-disposal-material/${disposal._id}`)}
                        >
                          <Edit2 className="w-5 h-5 text-amber-500 hover:text-amber-600" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Update
                          </span>
                        </div>

                        <div
                          className="group relative cursor-pointer"
                          onClick={() => handleDelete(disposal._id)}
                        >
                          <Trash2 className="w-5 h-5 text-amber-500 hover:text-amber-600" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">{disposal.disposalId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{disposal.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{disposal.materialName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{disposal.inventoryName}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{disposal.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{disposal.unit}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{disposal.requestedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{disposal.reasonOfDisposal}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{disposal.approvedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">
                      {new Date(disposal.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center p-4">
                    No disposal records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisposalMaterials;
