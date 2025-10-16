// src/pages/updateStockMovement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import {
  fetchStockMovementById,
  updateStockMovement,
} from "../services/FstockMovementService.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";
import { fetchRawMaterial } from "../services/FrawMaterialsService.js";
import { fetchManuProducts } from "../services/FmanuProductsService.js";

const UpdateStockMovementForm = ({ loggedInUserId }) => {
  const { id } = useParams();
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
    isDispatchedDateChanged: false,
  });

  const [fromLocations, setFromLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [errors, setErrors] = useState({});

  const units = ["pcs", "kg", "m"];

  // 🔹 Fetch existing stock movement by ID
  useEffect(() => {
    const getStockMovement = async () => {
      try {
        const data = await fetchStockMovementById(id);

        if (data.dispatchedDate) {
          data.dispatchedDate = new Date(data.dispatchedDate)
            .toISOString()
            .split("T")[0]; // YYYY-MM-DD format
        }
        
        setFormData(data);
      } catch (err) {
        console.error("Failed to fetch stock movement:", err);
      }
    };
    getStockMovement();
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

    const payload = {
      ...formData,
      updatedBy: loggedInUserId || "WM001",
    };

    try {
      await updateStockMovement(id, payload);
      alert("Stock movement updated successfully!");
      navigate("/warehouse-manager/stock-movement");
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to update stock movement" });
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
  <div className="m-6 flex justify-center">
  <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
          <h1 className="text-2xl font-bold mb-6">Update Stock Movement</h1>

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

            {/* Unit */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className={inputClass("unit")}
              >
                <option value="">-- Select Unit --</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
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
                className={inputClass("employeeId")}
              />
              {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
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
                className={inputClass("vehicleInfo")}
              />
              {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
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
                className={inputClass("dispatchedDate")}
                max={new Date().toISOString().split("T")[0]} // today
                min={new Date(new Date().setDate(new Date().getDate() - 3))
                  .toISOString()
                  .split("T")[0]} // 3 days before today
              />
              {errors.dispatchedDate && <p className="text-red-500 text-sm mt-1">{errors.dispatchedDate}</p>}
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
                onClick={() => navigate("/warehouse-manager/stock-movement")}
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

export default UpdateStockMovementForm;
