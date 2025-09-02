// src/pages/addTransferRequestForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import { addTransferRequest } from "../services/FtransferRequestService.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";

const AddTransferRequest = ({ loggedInUserId }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialId: "",
    fromLocation: "",
    toLocation: "",
    quantity: "",
    reason: "",
    status: "Pending",
    requiredBy: "",
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
      await addTransferRequest(payload);
      alert("Transfer Request added successfully!");
      navigate("/transfer-request");
    } catch (err) {
      console.error(err);
      alert("Failed to add transfer request");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="border-2 border-gray-300 m-auto p-8 w-3xl rounded shadow">
          <h1 className="text-2xl font-bold mb-6">Add Transfer Request</h1>
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

            

            {/* Required By / Dispatched Date */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Required By <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="requiredBy"
                value={formData.requiredBy}
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
                Add Transfer Request
              </button>
              <button
                type="button"
                onClick={() => navigate("/transfer-request")}
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

export default AddTransferRequest;
