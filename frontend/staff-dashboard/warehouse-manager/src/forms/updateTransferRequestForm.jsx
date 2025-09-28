// src/pages/updateTransferRequestForm.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import {
  fetchTransferRequestById,
  updateTransferRequest,
} from "../services/FtransferRequestService.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";
import { fetchRawMaterial } from "../services/FrawMaterialsService.js";
import { fetchManuProducts } from "../services/FmanuProductsService.js";

const UpdateTransferRequestForm = ({ loggedInUserId }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialId: "",
    fromLocation: "",
    toLocation: "",
    quantity: "",
    reason: "",
    requiredBy: "",
    status: ""
  });

  const [fromLocations, setFromLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [errors, setErrors] = useState({});




  // 🔹 Fetch existing transfer request by ID
  useEffect(() => {
    const getTransferRequest = async () => {
      try {
        const data = await fetchTransferRequestById(id);
        
        // Convert requiredBy to YYYY-MM-DD format for input type="date"
      if (data.requiredBy) {
        const date = new Date(data.requiredBy);
        const formattedDate = date.toISOString().split("T")[0];
        data.requiredBy = formattedDate;
      }

        setFormData(data);
      } catch (err) {
        console.error("Failed to fetch transfer request:", err);
      }
    };
    getTransferRequest();
  }, [id]);

  // 🔹 Fetch all locations for To Location & filter From Locations based on material
  useEffect(() => {
    const getLocationsForMaterial = async () => {
      try {
        const allInventories = await fetchInvLocation();
        setAllLocations(allInventories);

        if (!formData.materialId) {
          setFromLocations([]);
          return;
        }

        const [rawMaterials, manuProducts] = await Promise.all([
          fetchRawMaterial(),
          fetchManuProducts(),
        ]);

        const rawInvNames = rawMaterials
          .filter((rm) => rm.materialId === formData.materialId)
          .map((rm) => rm.inventoryName);

        const manuInvNames = manuProducts
          .filter((mp) => mp.materialId === formData.materialId)
          .map((mp) => mp.inventoryName);

        const validFromInvNames = [...new Set([...rawInvNames, ...manuInvNames])];

        const filteredFrom = allInventories.filter((inv) =>
          validFromInvNames.includes(inv.inventoryName)
        );

        setFromLocations(filteredFrom);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };

    getLocationsForMaterial();
  }, [formData.materialId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Frontend validation
    const newErrors = {};
    if (!formData.fromLocation) newErrors.fromLocation = "From Location is required";
    if (!formData.toLocation) newErrors.toLocation = "To Location is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (!formData.reason) newErrors.reason = "Reason is required";
    if (!formData.requiredBy) newErrors.requiredBy = "Required By date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // stop submission
    }

    const payload = {
      ...formData,
      requestedBy: loggedInUserId || "WM001",
      approvedBy: loggedInUserId || "M002",
    };

    try {
      await updateTransferRequest(id, payload);
      alert("Transfer Request updated successfully!");
      navigate("/transfer-request");
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to update transfer request" });
      }
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="border-2 border-gray-300 m-auto p-8 w-xl shadow bg-[#FFF8E8]">
          <h1 className="text-2xl font-bold mb-6">Update Transfer Request</h1>

          {errors.general && (
            <p className="text-red-600 font-semibold mb-4">{errors.general}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm max-w-3xl ">
            {/* Material ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Material ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="materialId"
                value={formData.materialId}
                disabled
                className={inputClass("materialId")}
              />
              {errors.materialId && <p className="text-red-500 text-sm mt-1">{errors.materialId}</p>}
            </div>

            {/* From Location */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                From Location <span className="text-red-500">*</span>
              </label>
              <select
                name="fromLocation"
                value={formData.fromLocation}
                onChange={handleChange}
                required
                className={inputClass("fromLocation")}
              >
                <option value="">-- Select From Location --</option>
                {fromLocations.map((loc) => (
                  <option key={loc._id} value={loc.inventoryName}>
                    {loc.inventoryName} ({loc.inventoryId})
                  </option>
                ))}
              </select>
              {errors.fromLocation && <p className="text-red-500 text-sm mt-1">{errors.fromLocation}</p>}
            </div>

            {/* To Location */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                To Location <span className="text-red-500">*</span>
              </label>
              <select
                name="toLocation"
                value={formData.toLocation}
                onChange={handleChange}
                required
                className={inputClass("toLocation")}
              >
                <option value="">-- Select To Location --</option>
                {allLocations
                  .filter((loc) => loc.inventoryName !== formData.fromLocation)
                  .map((loc) => (
                    <option key={loc._id} value={loc.inventoryName}>
                      {loc.inventoryName} ({loc.inventoryId})
                    </option>
                  ))}
              </select>
              {errors.toLocation && <p className="text-red-500 text-sm mt-1">{errors.toLocation}</p>}
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
                className={inputClass("quantity")}
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
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
                className={inputClass("reason")}
              />
              {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
            </div>

            {/* Required By */}
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
                min={new Date().toISOString().split("T")[0]} // <-- Only future dates allowed
              />
              {errors.requiredBy && <p className="text-red-500 text-sm mt-1">{errors.requiredBy}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
              >
                Update Stock Movement
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

export default UpdateTransferRequestForm;
