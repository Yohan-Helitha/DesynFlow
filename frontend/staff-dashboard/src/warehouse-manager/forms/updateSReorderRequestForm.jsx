import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import { fetchSReorderRequestById, updateSReorderRequest } from "../services/FsReorderRequestService.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";
import { fetchRawMaterial } from "../services/FrawMaterialsService.js";
import { fetchManuProducts } from "../services/FmanuProductsService.js";

const UpdateSReorderRequestForm = ({ loggedInUserId }) => {
  const { id } = useParams();
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
    warehouseManagerName: loggedInUserId || "",
    status: "Pending"
  });

  const [availableInventories, setAvailableInventories] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const units = ["pcs", "kg", "m"];

  // 🔹 Fetch existing stock reorder request by ID
  useEffect(() => {
    const getRequest = async () => {
      try {
        setLoading(true);
        const data = await fetchSReorderRequestById(id);

        if (data) {
          // Format the date for the input field
          if (data.expectedDate) {
            const formattedDate = new Date(data.expectedDate).toISOString().split("T")[0];
            data.expectedDate = formattedDate;
          }

          setFormData({
            inventoryId: data.inventoryId || "",
            inventoryName: data.inventoryName || "",
            inventoryAddress: data.inventoryAddress || "",
            inventoryContact: data.inventoryContact || "",
            materialId: data.materialId || "",
            materialName: data.materialName || "",
            quantity: data.quantity || "",
            type: data.type || "",
            unit: data.unit || "",
            expectedDate: data.expectedDate || "",
            warehouseManagerName: data.warehouseManagerName || loggedInUserId || "",
            status: data.status || "Pending"
          });
        }
      } catch (err) {
        console.error("Failed to fetch stock reorder request:", err);
        setErrors({ general: "Failed to load request data" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getRequest();
    }
  }, [id, loggedInUserId]);

  // 🔹 Fetch all inventories and materials
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch inventories
        const inventories = await fetchInvLocation();
        setAvailableInventories(inventories || []);

        // Fetch materials - combine raw materials and manufactured products
        const rawMaterials = await fetchRawMaterial();
        const manuProducts = await fetchManuProducts();
        
        // Combine both arrays, ensuring they exist
        const rawMaterialsArray = Array.isArray(rawMaterials) ? rawMaterials : [];
        const manuProductsArray = Array.isArray(manuProducts) ? manuProducts : [];
        
        const allMaterials = [...rawMaterialsArray, ...manuProductsArray];
        setAvailableMaterials(allMaterials);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setErrors(prev => ({ ...prev, general: "Failed to load form data" }));
      }
    };
    
    fetchData();
  }, []);

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // 🔹 Auto-fill inventory details when selected
  const handleInventoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedInv = availableInventories.find(inv => inv.inventoryId === selectedId);
    
    if (selectedInv) {
      setFormData(prev => ({
        ...prev,
        inventoryId: selectedId,
        inventoryName: selectedInv.inventoryName || "",
        inventoryAddress: selectedInv.address || "",
        inventoryContact: selectedInv.contact || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        inventoryId: selectedId,
        inventoryName: "",
        inventoryAddress: "",
        inventoryContact: ""
      }));
    }
    
    // Clear inventory-related errors
    if (errors.inventoryId) {
      setErrors(prev => ({ ...prev, inventoryId: "" }));
    }
  };

  // 🔹 Auto-fill material details when selected
  const handleMaterialChange = (e) => {
    const materialId = e.target.value;
    const material = availableMaterials.find(m => m.materialId === materialId);
    
    if (material) {
      setFormData(prev => ({
        ...prev,
        materialId: materialId,
        materialName: material.materialName || "",
        type: material.type || "",
        unit: material.unit || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        materialId: materialId,
        materialName: "",
        type: "",
        unit: ""
      }));
    }
    
    // Clear material-related errors
    if (errors.materialId) {
      setErrors(prev => ({ ...prev, materialId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.inventoryId) newErrors.inventoryId = "Inventory is required";
    if (!formData.materialId) newErrors.materialId = "Material is required";
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Valid quantity is required";
    if (!formData.expectedDate) newErrors.expectedDate = "Expected Date is required";
    if (!formData.inventoryName.trim()) newErrors.inventoryName = "Inventory Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateSReorderRequest(id, formData);
      alert("Stock Reorder Request updated successfully!");
      navigate("/warehouse-manager/reorder-request");
    } catch (err) {
      console.error("Update error:", err);
      if (err.errors) {
        // Backend validation errors
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to update request" });
      }
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div>
      <Navbar />
      <div className="m-6">
        <div className="border-2 border-gray-300 m-auto p-8 w-xl shadow bg-[#FFF8E8]">
          <h1 className="text-2xl font-bold mb-6">Update Stock Reorder Request</h1>

          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm max-w-3xl">
            {/* Inventory */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Inventory <span className="text-red-500">*</span>
              </label>
              <select
                name="inventoryId"
                value={formData.inventoryId}
                onChange={handleInventoryChange}
                className={inputClass("inventoryId")}
                required
              >
                <option value="">-- Select Inventory --</option>
                {availableInventories.map(inv => (
                  <option key={inv.inventoryId} value={inv.inventoryId}>
                    {inv.inventoryName} ({inv.inventoryId})
                  </option>
                ))}
              </select>
              {errors.inventoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.inventoryId}</p>
              )}
            </div>

            {/* Inventory Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Inventory Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="inventoryName"
                value={formData.inventoryName} 
                onChange={handleChange}
                className={inputClass("inventoryName")} 
                required
              />
              {errors.inventoryName && (
                <p className="text-red-500 text-sm mt-1">{errors.inventoryName}</p>
              )}
            </div>

            {/* Inventory Address */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Inventory Address</label>
              <input 
                type="text" 
                name="inventoryAddress"
                value={formData.inventoryAddress} 
                onChange={handleChange}
                className={inputClass("inventoryAddress")} 
              />
            </div>

            {/* Inventory Contact */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Inventory Contact</label>
              <input 
                type="text" 
                name="inventoryContact"
                value={formData.inventoryContact} 
                onChange={handleChange}
                className={inputClass("inventoryContact")} 
              />
            </div>

            {/* Material */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Material <span className="text-red-500">*</span>
              </label>
              <select
                name="materialId"
                value={formData.materialId}
                onChange={handleMaterialChange}
                className={inputClass("materialId")}
                required
              >
                <option value="">-- Select Material --</option>
                {availableMaterials.map(m => (
                  <option key={m.materialId} value={m.materialId}>
                    {m.materialName} ({m.materialId})
                  </option>
                ))}
              </select>
              {errors.materialId && (
                <p className="text-red-500 text-sm mt-1">{errors.materialId}</p>
              )}
            </div>

            {/* Material Name */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Material Name</label>
              <input 
                type="text" 
                value={formData.materialName} 
                readOnly 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            {/* Material Type */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Type</label>
              <input 
                type="text" 
                value={formData.type} 
                readOnly 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
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
                min="1"
                className={inputClass("quantity")}
                required
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Unit</label>
              <input 
                type="text" 
                value={formData.unit} 
                readOnly 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            {/* Expected Date */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Expected Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expectedDate"
                value={formData.expectedDate}
                onChange={handleChange}
                className={inputClass("expectedDate")}
                required
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.expectedDate && (
                <p className="text-red-500 text-sm mt-1">{errors.expectedDate}</p>
              )}
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
                className={inputClass("status")}
                required
              >
                <option value="Pending">Pending</option>
                <option value="Checked">Checked</option>
                <option value="Restocked">Restocked</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button 
                type="submit" 
                className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Request"}
              </button>
              <button 
                type="button" 
                onClick={() => navigate("/warehouse-manager/reorder-request")} 
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
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

export default UpdateSReorderRequestForm;