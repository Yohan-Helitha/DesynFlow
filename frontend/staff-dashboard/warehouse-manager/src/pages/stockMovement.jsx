import Navbar from "../component/navbar.jsx";
import React, { useState, useEffect } from "react";
import { fetchStockMovements, deleteStockMovement } from "../services/FstockMovementService.js";
import { Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StockMovement = () => {
  const [movements, setMovements] = useState([]);
  const navigate = useNavigate();

  // Fetch movements
  const getMovements = async () => {
    try {
      const data = await fetchStockMovements();
      setMovements(data);
    } catch (err) {
      console.error("Failed to fetch stock movements:", err);
    }
  };

  useEffect(() => {
    getMovements();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this stock movement?");
    if (!confirmDelete) return;

    try {
      await deleteStockMovement(id);
      await getMovements();
      alert("Stock movement deleted successfully!");
    } catch (err) {
      console.error("Failed to delete stock movement:", err);
      alert("Failed to delete stock movement.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Stock Movements</h1>
          <button
            className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/add-movement")}
          >
            + Add Stock Movement
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Actions</th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">Stock ID</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Material ID</th>
                <th className="border border-gray-300 px-4 py-2 w-48">From Location</th>
                <th className="border border-gray-300 px-4 py-2 w-48">To Location</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Unit</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 w-56">Reason</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Requested By</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Approved By</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Employee ID</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Vehicle Info</th>
                <th className="border border-gray-300 px-4 py-2 w-16">Dispatched Date</th>
                <th className="border border-gray-300 px-4 py-2 w-32">Created At</th>
              </tr>
            </thead>
            <tbody className="align-middle text-center text-xs bg-white">
              {movements.length > 0 ? (
                movements.map((movement) => (
                  <tr key={movement._id}>
                    {/* Actions */}
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                      <div className="flex items-center justify-center gap-6">
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => navigate(`/update-movement/${movement._id}`)}
                        >
                          <Edit2 className="w-5 h-5  text-amber-500 hover:text-amber-600" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100">
                            Update
                          </span>
                        </div>

                        <div
                          className="group relative cursor-pointer"
                          onClick={() => handleDelete(movement._id)}
                        >
                          <Trash2 className="w-5 h-5  text-amber-500 hover:text-amber-600" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Table Data */}
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">{movement.stockId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{movement.materialId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-48">{movement.fromLocation}</td>
                    <td className="border border-gray-300 px-4 py-2 w-8">{movement.toLocation}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{movement.unit}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{movement.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 w-56">{movement.reason}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{movement.requestedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{movement.approvedBy}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{movement.employeeId}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{movement.vehicleInfo}</td>
                    <td className="border border-gray-300 px-4 py-2 w-16">{movement.dispatchedDate ? new Date(movement.dispatchedDate).toLocaleDateString() : "-"}</td>
                    <td className="border border-gray-300 px-4 py-2 w-32">{new Date(movement.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="text-center p-4">No stock movements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockMovement;
