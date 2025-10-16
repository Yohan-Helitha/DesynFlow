import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDisposalRecordById, updateDisposalMaterial } from "../services/FdisposalMaterialsService.js";

const UpdateDisposalMaterialsForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    materialId: "",
    materialName: "",
    inventoryId: "",
    inventoryName: "",
    quantity: "",
    unit: "",
    reasonOfDisposal: "",
  });

  const [errors, setErrors] = useState({});

  // 🔹 Add same inputClass function like Add form
  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md bg-white ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  // 🔹 Fetch record by ID
  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchDisposalRecordById(id);
        console.log("Fetched disposal record:", data);

        if (data) {
          const d = data.disposal_material || data; // support both shapes
          setFormData({
            materialId: d.materialId || "",
            materialName: d.materialName || "",
            inventoryId: d.inventoryId || "",
            inventoryName: d.inventoryName || "",
            quantity: d.quantity || "",
            unit: d.unit || "",
            reasonOfDisposal: d.reasonOfDisposal || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch record:", err);
        setErrors({ general: "Failed to load disposal record." });
      }
    };
    getData();
  }, [id]);

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

    // 🔹 Validation like Add form
    const newErrors = {};
    if (!formData.materialId) newErrors.materialId = "Material ID is required";
    if (!formData.materialName) newErrors.materialName = "Material Name is required";
    if (!formData.inventoryName) newErrors.inventoryName = "Inventory is required";
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.reasonOfDisposal) newErrors.reasonOfDisposal = "Reason is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateDisposalMaterial(id, formData);
      alert("Disposal material updated successfully!");
      navigate("/warehouse-manager/disposal-materials");
    } catch (err) {
      console.error("Update error:", err);
      setErrors({ general: "Failed to update disposal material." });
    }
  };

  return (
    <div>
      <Navbar />
  <div className="m-6 flex justify-center">
  <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
          <h1 className="text-2xl font-bold mb-6">Update Disposal Material</h1>

          {errors.general && (
            <p className="text-red-600 font-semibold mb-4">{errors.general}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm">
            {/* Material ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Material ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="materialId"
                value={formData.materialId}
                readOnly
                className={inputClass("materialId")}
              />
              {errors.materialId && (
                <p className="text-red-500 text-sm mt-1">{errors.materialId}</p>
              )}
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
                onChange={handleChange}
                readOnly
                className={inputClass("materialName")}
              />
              {errors.materialName && (
                <p className="text-red-500 text-sm mt-1">{errors.materialName}</p>
              )}
            </div>

            {/* Inventory */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Inventory <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="inventoryId"
                value={formData.inventoryName}
                onChange={handleChange}
                readOnly
                className={inputClass("inventoryId")}
              />
              {errors.inventoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.inventoryId}</p>
              )}
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
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
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
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
              )}
            </div>

            {/* Reason Of Disposal */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Reason Of Disposal <span className="text-red-500">*</span>
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
                Update
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

export default UpdateDisposalMaterialsForm;