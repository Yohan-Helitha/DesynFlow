// src/pages/addSReorderRequestForm.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import { addSReorderRequest } from "../services/FsReorderRequestService.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";
import { fetchRawMaterial } from "../services/FrawMaterialsService.js";
import { fetchManuProducts } from "../services/FmanuProductsService.js";

const AddSReorderRequestForm = ({ loggedInUserId }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    inventoryId: "",
    inventoryName: "",
    inventoryAddress: "",
    inventoryContact: "",
    materialId: "",
    materialName: "",
    quantity: "",
    type: "",
    unit: "",
    expectedDate: "",
    warehouseManagerName: loggedInUserId || "WM001",
    status: "Pending",
  });

  const [allInventories, setAllInventories] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [errors, setErrors] = useState({});

  const units = ["pcs", "kg", "m"]; // dropdown options

  // 🔹 Fetch inventories and materials
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventories = await fetchInvLocation();
        setAllInventories(inventories);

        const [rawMaterials, manuProducts] = await Promise.all([
          fetchRawMaterial(),
          fetchManuProducts(),
        ]);
        setAvailableMaterials([...rawMaterials, ...manuProducts]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Auto-fill material details when materialId changes
  useEffect(() => {
    if (!formData.materialId) {
      setFormData((prev) => ({ ...prev, materialName: "", unit: "", type: "" }));
      return;
    }
    const material = availableMaterials.find((m) => m.materialId === formData.materialId);
    if (material) {
      setFormData((prev) => ({
        ...prev,
        materialName: material.materialName,
        unit: material.unit,
        type: material.type,
      }));
    } else {
      setFormData((prev) => ({ ...prev, materialName: "", unit: "", type: "" }));
    }
  }, [formData.materialId, availableMaterials]);

  // 🔹 Auto-fill inventory details when inventoryId changes
  useEffect(() => {
    if (!formData.inventoryId) {
      setFormData((prev) => ({ ...prev, inventoryName: "", inventoryAddress: "", inventoryContact: "" }));
      return;
    }
    const inventory = allInventories.find((i) => i.inventoryId === formData.inventoryId);
    if (inventory) {
      setFormData((prev) => ({
        ...prev,
        inventoryName: inventory.inventoryName,
        inventoryAddress: inventory.inventoryAddress || "",
        inventoryContact: inventory.inventoryContact || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, inventoryName: "", inventoryAddress: "", inventoryContact: "" }));
    }
  }, [formData.inventoryId, allInventories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.materialId || !formData.inventoryId || !formData.quantity) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        warehouseManagerName: loggedInUserId || "WM001",
      };
      await addSReorderRequest(payload);
      alert("Stock Reorder Request added successfully!");
      navigate("/s-reorder-requests");
    } catch (err) {
      console.error(err);
      setErrors({ general: err.message || "Failed to add stock reorder request" });
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
          <h1 className="text-2xl font-bold mb-6">Add Stock Reorder Request</h1>

          {errors.general && <p className="text-red-600 font-semibold mb-4">{errors.general}</p>}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm max-w-3xl">
            {/* Inventory ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Inventory ID <span className="text-red-500">*</span></label>
              <select
                name="inventoryId"
                value={formData.inventoryId}
                onChange={handleChange}
                required
                className={inputClass("inventoryId")}
              >
                <option value="">-- Select Inventory --</option>
                {allInventories.map((inv) => (
                  <option key={inv._id} value={inv.inventoryId}>{inv.inventoryName} ({inv.inventoryId})</option>
                ))}
              </select>
            </div>

            {/* Inventory Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Inventory Name</label>
              <input type="text" name="inventoryName" value={formData.inventoryName} readOnly className={inputClass("inventoryName")} />
            </div>

            {/* Inventory Address */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Inventory Address</label>
              <input type="text" name="inventoryAddress" value={formData.inventoryAddress} readOnly className={inputClass("inventoryAddress")} />
            </div>

            {/* Inventory Contact */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Inventory Contact</label>
              <input type="text" name="inventoryContact" value={formData.inventoryContact} readOnly className={inputClass("inventoryContact")} />
            </div>

            {/* Material ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Material ID <span className="text-red-500">*</span></label>
              <select name="materialId" value={formData.materialId} onChange={handleChange} required className={inputClass("materialId")}>
                <option value="">-- Select Material --</option>
                {availableMaterials.map((m) => (
                  <option key={m._id} value={m.materialId}>{m.materialName} ({m.materialId})</option>
                ))}
              </select>
            </div>

            {/* Material Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Material Name</label>
              <input type="text" name="materialName" value={formData.materialName} readOnly className={inputClass("materialName")} />
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required className={inputClass("quantity")} />
            </div>

            {/* Type */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Type</label>
              <input type="text" name="type" value={formData.type} readOnly className={inputClass("type")} />
            </div>

            {/* Unit */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange} required className={inputClass("unit")}>
                <option value="">-- Select Unit --</option>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Expected Date */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Expected Date <span className="text-red-500">*</span></label>
              <input type="date" name="expectedDate" value={formData.expectedDate} onChange={handleChange} required className={inputClass("expectedDate")} min={new Date().toISOString().split("T")[0]} />
            </div>


            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button type="submit" className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md">Add Request</button>
              <button type="button" onClick={() => navigate("/s-reorder-requests")} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSReorderRequestForm;
