// src/pages/addStockMovement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import { addStockMovement } from "../services/FstockMovementService.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";

const AddStockMovement = ({ loggedInUserId }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialId: "",
    fromLocation: "",
    toLocation: "",
    unit: "",
    quantity: "",
    reason: "",
    employeeId: "",
    vehicleInfo: "",
    dispatchedDate: "",
  });

  const [locations, setLocations] = useState([]);

  // Fetch locations on load
  useEffect(() => {
    const getLocations = async () => {
      try {
        const data = await fetchInvLocation();
        setLocations(data || []);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };
    getLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      createdBy: loggedInUserId || "WM001",
    };

    try {
      await addStockMovement(payload);
      alert("Stock movement added successfully!");
      navigate("/stock-movement");
    } catch (err) {
      console.error(err);
      alert("Failed to add stock movement");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="border-2 border-gray-300 m-auto p-8 w-3xl rounded shadow">
          <h1 className="text-2xl font-bold mb-6">Add Stock Movement</h1>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Material ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Material ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="materialId"
                value={formData.materialId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* From Location (Dropdown) */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                From Location <span className="text-red-500">*</span>
              </label>
              <select
                name="fromLocation"
                value={formData.fromLocation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select From Location --</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc.inventoryName}>
                    {loc.inventoryName} ({loc.inventoryId})
                  </option>
                ))}
              </select>
            </div>

            {/* To Location (Dropdown) */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                To Location <span className="text-red-500">*</span>
              </label>
              <select
                name="toLocation"
                value={formData.toLocation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select To Location --</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc.inventoryName}>
                    {loc.inventoryName} ({loc.inventoryId})
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Employee ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Vehicle Info */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Vehicle Info <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicleInfo"
                value={formData.vehicleInfo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Dispatched Date */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Dispatched Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dispatchedDate"
                value={formData.dispatchedDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
              >
                Add Stock Movement
              </button>
              <button
                type="button"
                onClick={() => navigate("/stock-movement")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStockMovement;
