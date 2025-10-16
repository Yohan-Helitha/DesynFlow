import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import { addDisposalMaterial,fetchDisposalMaterialsById } from "../services/FdisposalMaterialsService.js";


const AddDisposalMaterialsForm = ({ loggedInUserId }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialId: "",
    materialName: "",
    inventoryName: "",
    quantity: "",
    unit: "",
    reasonOfDisposal: "",
  });

  const [availableInventories, setAvailableInventories] = useState([]);
  const [errors, setErrors] = useState({});

  const units = ["pcs", "kg", "m"];

  // 🔹 Material ID input handler
  const handleMaterialIdInput = async (e) => {
  const materialId = e.target.value;
  setFormData((prev) => ({ ...prev, materialId }));

  if (materialId) {
    const data = await fetchDisposalMaterialsById(materialId);
    if (data) {
      setFormData((prev) => ({
        ...prev,
        materialName: data.materialName,
        unit: data.unit,
      }));
      setAvailableInventories(data.inventories || []);
    } else {
      setFormData((prev) => ({ ...prev, materialName: "", unit: "" }));
      setAvailableInventories([]);
    }
  } else {
    setFormData((prev) => ({ ...prev, materialName: "", unit: "" }));
    setAvailableInventories([]);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInventoryChange = (e) => {
  const selectedId = e.target.value;
  const selectedInv = availableInventories.find(inv => inv.inventoryId === selectedId);

   if (!selectedInv) return;

  setFormData(prev => ({
    ...prev,
    inventoryId: selectedId,
    inventoryName: selectedInv.inventoryName, // set inventoryName too
  }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // 🔹 Ensure inventoryName is set
  if (!formData.inventoryName) {
    alert("Please select a valid inventory.");
    return;
  }

    try {
      await addDisposalMaterial({
        ...formData,
        requestedBy: loggedInUserId || "WM001",
        approvedBy: "Manager001", // or get from context
        createdAt: new Date().toISOString(),
      });
      alert("Disposal material added successfully!");
      navigate("/warehouse-manager/disposal-materials");
    } catch (err) {
      console.error(err);
      alert("Failed to add disposal material");
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md bg-white ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div>
      <Navbar />
  <div className="m-6 flex justify-center">
  <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
          <h1 className="text-2xl font-bold mb-6">Add Disposal Material</h1>

          {errors.general && <p className="text-red-600 font-semibold mb-4">{errors.general}</p>}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm ">
            {/* Material ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Material ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="materialId"
                value={formData.materialId}
                onChange={handleMaterialIdInput}
                required
                className={inputClass("materialId")}
                placeholder="MP001 / RM001"
              />
              {errors.materialId && <p className="text-red-500 text-sm mt-1">{errors.materialId}</p>}
            </div>

            {/* Material Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Material Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="materialName"
                value={formData.materialName}
                readOnly
                className={inputClass("materialName")}
              />
              {errors.materialName && <p className="text-red-500 text-sm mt-1">{errors.materialName}</p>}
            </div>

            {/* Inventory */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Inventory <span className="text-red-500">*</span>
              </label>
              <select
                name="inventoryId"
                value={formData.inventoryId}
                onChange={handleInventoryChange}
                required
                className={inputClass("inventoryId")}
              >
                <option value="">-- Select Inventory --</option>
                {availableInventories.map((inv) => (
                  <option key={inv.inventoryId} value={inv.inventoryId}>
                    {inv.inventoryName} ({inv.inventoryId})
                  </option>
                ))}
              </select>
              {errors.inventoryId && <p className="text-red-500 text-sm mt-1">{errors.inventoryId}</p>}
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
                min="1"
                required
                className={inputClass("quantity")}
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
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
                readOnly
                className={inputClass("unit")}
              />
              {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
            </div>

            

            {/* Reason of Disposal */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Reason of Disposal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reasonOfDisposal"
                value={formData.reasonOfDisposal}
                onChange={handleChange}
                required
                className={inputClass("reasonOfDisposal")}
              />
              {errors.reasonOfDisposal && (
                <p className="text-red-500 text-sm mt-1">{errors.reasonOfDisposal}</p>
              )}
            </div>


            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
              >
                Add Disposal Material
              </button>
              <button
                type="button"
                onClick={() => navigate("/warehouse-manager/disposal-materials")}
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

export default AddDisposalMaterialsForm;
