import Navbar from "../component/navbar";
import React, { useState, useEffect } from "react";
import { fetchInvLocation, deleteInvLocation } from "../services/FinvLocationService.js"; // you need to create this service
import { Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InvLocation = () => {
  const [inventories, setInventories] = useState([]);
  const navigate = useNavigate();

  // Fetch inventories
  const getInventories = async () => {
    try {
      const data = await fetchInvLocation();
      setInventories(data);
    } catch (err) {
      console.error("Failed to fetch inventories:", err);
    }
  };

  useEffect(() => {
    getInventories();
  }, []);

  // Delete inventory
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this inventory?");
    if (!confirmDelete) return;

    try {
      await deleteInvLocation(id);
      setInventories(inventories.filter(inv => inv._id !== id));
      alert("Inventory deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete inventory.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mt-6 mb-10">Inventory Locations</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow mt-6 mb-10"
            onClick={() => navigate("/add-location")}
          >
            + Add Location
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 sticky left-0 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                  Actions
                </th>
                <th className="border border-gray-300 px-4 py-2 sticky left-32 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                  Inventory ID
                </th>
                <th className="border border-gray-300 px-4 py-2 sticky left-64 w-32 bg-gray-200 z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                  Inventory Name
                </th>
                <th className="border border-gray-300 px-4 py-2">Address</th>
                <th className="border border-gray-300 px-4 py-2">Country</th>
                <th className="border border-gray-300 px-4 py-2">Capacity (m³)</th>
                <th className="border border-gray-300 px-4 py-2">Contact</th>
                <th className="border border-gray-300 px-4 py-2">Warehouse Manager</th>
                <th className="border border-gray-300 px-4 py-2">Created At</th>
              </tr>
            </thead>

            <tbody className="text-center align-middle">
              {inventories.length > 0 ? (
                inventories.map((inv) => (
                  <tr key={inv._id}>
                    <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                      <div className="flex items-center justify-center gap-4">
                        <div
                          className="cursor-pointer"
                          onClick={() => navigate(`/update-location/${inv._id}`)}
                        >
                          <Edit2 className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() => handleDelete(inv._id)}
                        >
                          <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 sticky left-32 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                      {inv.inventoryId}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 sticky left-64 bg-white z-40 relative after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px after:bg-gray-300 after:z-50">
                      {inv.inventoryName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{inv.inventoryAddress}</td>
                    <td className="border border-gray-300 px-4 py-2">{inv.country}</td>
                    <td className="border border-gray-300 px-4 py-2">{inv.capacity}</td>
                    <td className="border border-gray-300 px-4 py-2">{inv.inventoryContact}</td>
                    <td className="border border-gray-300 px-4 py-2">{inv.warehouseManagerName}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(inv.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center p-4">
                    No inventories found.
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

export default InvLocation;
