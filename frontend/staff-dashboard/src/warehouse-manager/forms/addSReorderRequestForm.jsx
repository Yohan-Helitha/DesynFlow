// // src/pages/addSReorderRequestForm.jsx

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../component/navbar.jsx";
// import { addSReorderRequest } from "../services/FsReorderRequestService.js";
// import { fetchInvLocation } from "../services/FinvLocationService.js";
// import { fetchRawMaterial } from "../services/FrawMaterialsService.js";
// import { fetchManuProducts } from "../services/FmanuProductsService.js";

// const AddSReorderRequestForm = ({ loggedInUserId }) => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     inventoryId: "",
//     inventoryName: "",
//     inventoryAddress: "",
//     inventoryContact: "",
//     materialId: "",
//     materialName: "",
//     quantity: "",
//     type: "",
//     unit: "",
//     expectedDate: "",
//     warehouseManagerName: loggedInUserId || "WM001",
//     status: "Pending",
//   });

//   const [allInventories, setAllInventories] = useState([]);
//   const [availableMaterials, setAvailableMaterials] = useState([]);
//   const [errors, setErrors] = useState({});

//   const units = ["pcs", "kg", "m"]; // dropdown options

//   // 🔹 Fetch inventories and materials
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const inventories = await fetchInvLocation();
//         setAllInventories(inventories);

//         const [rawMaterials, manuProducts] = await Promise.all([
//           fetchRawMaterial(),
//           fetchManuProducts(),
//         ]);
//         setAvailableMaterials([...rawMaterials, ...manuProducts]);
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//       }
//     };
//     fetchData();
//   }, []);

//   // 🔹 Auto-fill material details when materialId changes
//   useEffect(() => {
//     if (!formData.materialId) {
//       setFormData((prev) => ({ ...prev, materialName: "", unit: "", type: "" }));
//       return;
//     }
//     const material = availableMaterials.find((m) => m.materialId === formData.materialId);
//     if (material) {
//       setFormData((prev) => ({
//         ...prev,
//         materialName: material.materialName,
//         unit: material.unit,
//         type: material.type,
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, materialName: "", unit: "", type: "" }));
//     }
//   }, [formData.materialId, availableMaterials]);

//   // 🔹 Auto-fill inventory details when inventoryId changes
//   useEffect(() => {
//     if (!formData.inventoryId) {
//       setFormData((prev) => ({ ...prev, inventoryName: "", inventoryAddress: "", inventoryContact: "" }));
//       return;
//     }
//     const inventory = allInventories.find((i) => i.inventoryId === formData.inventoryId);
//     if (inventory) {
//       setFormData((prev) => ({
//         ...prev,
//         inventoryName: inventory.inventoryName,
//         inventoryAddress: inventory.inventoryAddress || "",
//         inventoryContact: inventory.inventoryContact || "",
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, inventoryName: "", inventoryAddress: "", inventoryContact: "" }));
//     }
//   }, [formData.inventoryId, allInventories]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     if (!formData.materialId || !formData.inventoryId || !formData.quantity) {
//       alert("Please fill all required fields");
//       return;
//     }

//     try {
//       const payload = {
//         ...formData,
//         warehouseManagerName: loggedInUserId || "WM001",
//       };
//       await addSReorderRequest(payload);
//       alert("Stock Reorder Request added successfully!");
//       navigate("/warehouse-manager/reorder-request");
//     } catch (err) {
//       console.error(err);
//       setErrors({ general: err.message || "Failed to add stock reorder request" });
//     }
//   };

//   const inputClass = (field) =>
//     `w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 ${
//       errors[field] ? "border-red-500" : "border-gray-300"
//     }`;

//   return (
//     <div>
//       <Navbar />
//   <div className="m-6 flex justify-center">
//   <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
//           <h1 className="text-2xl font-bold mb-6">Add Stock Reorder Request</h1>

//           {errors.general && <p className="text-red-600 font-semibold mb-4">{errors.general}</p>}

//           <form onSubmit={handleSubmit} className="space-y-4 text-sm max-w-3xl">
//             {/* Inventory ID */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Inventory ID <span className="text-red-500">*</span></label>
//               <select
//                 name="inventoryId"
//                 value={formData.inventoryId}
//                 onChange={handleChange}
//                 required
//                 className={inputClass("inventoryId")}
//               >
//                 <option value="">-- Select Inventory --</option>
//                 {allInventories.map((inv) => (
//                   <option key={inv._id} value={inv.inventoryId}>{inv.inventoryName} ({inv.inventoryId})</option>
//                 ))}
//               </select>
//             </div>

//             {/* Inventory Name */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Inventory Name</label>
//               <input type="text" name="inventoryName" value={formData.inventoryName} readOnly className={inputClass("inventoryName")} />
//             </div>

//             {/* Inventory Address */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Inventory Address</label>
//               <input type="text" name="inventoryAddress" value={formData.inventoryAddress} readOnly className={inputClass("inventoryAddress")} />
//             </div>

//             {/* Inventory Contact */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Inventory Contact</label>
//               <input type="text" name="inventoryContact" value={formData.inventoryContact} readOnly className={inputClass("inventoryContact")} />
//             </div>

//             {/* Material ID */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Material ID <span className="text-red-500">*</span></label>
//               <select name="materialId" value={formData.materialId} onChange={handleChange} required className={inputClass("materialId")}>
//                 <option value="">-- Select Material --</option>
//                 {availableMaterials.map((m) => (
//                   <option key={m._id} value={m.materialId}>{m.materialName} ({m.materialId})</option>
//                 ))}
//               </select>
//             </div>

//             {/* Material Name */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Material Name</label>
//               <input type="text" name="materialName" value={formData.materialName} readOnly className={inputClass("materialName")} />
//             </div>

//             {/* Quantity */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
//               <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required className={inputClass("quantity")} />
//             </div>

//             {/* Type */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Type</label>
//               <input type="text" name="type" value={formData.type} readOnly className={inputClass("type")} />
//             </div>

//             {/* Unit */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Unit</label>
//               <select name="unit" value={formData.unit} onChange={handleChange} required className={inputClass("unit")}>
//                 <option value="">-- Select Unit --</option>
//                 {units.map((u) => <option key={u} value={u}>{u}</option>)}
//               </select>
//             </div>

//             {/* Expected Date */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Expected Date <span className="text-red-500">*</span></label>
//               <input type="date" name="expectedDate" value={formData.expectedDate} onChange={handleChange} required className={inputClass("expectedDate")} min={new Date().toISOString().split("T")[0]} />
//             </div>


//             {/* Buttons */}
//             <div className="flex gap-4 pt-6">
//               <button type="submit" className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md">Add Request</button>
//               <button type="button" onClick={() => navigate("/warehouse-manager/reorder-request")} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md">Cancel</button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddSReorderRequestForm;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const units = ["pcs", "kg", "m"];

  // 🔹 Fetch inventories and materials
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [inventories, rawMaterials, manuProducts] = await Promise.all([
          fetchInvLocation(),
          fetchRawMaterial(),
          fetchManuProducts(),
        ]);
        
        setAllInventories(inventories);
        setAvailableMaterials([...rawMaterials, ...manuProducts]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setErrors({ general: "Failed to load form data" });
      } finally {
        setIsLoading(false);
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Validation
    const newErrors = {};
    if (!formData.inventoryId) newErrors.inventoryId = "Inventory is required";
    if (!formData.materialId) newErrors.materialId = "Material is required";
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Valid quantity is required";
    if (!formData.expectedDate) newErrors.expectedDate = "Expected date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        warehouseManagerName: loggedInUserId || "WM001",
      };
      await addSReorderRequest(payload);
      alert("Stock Reorder Request added successfully!");
      navigate("/warehouse-manager/reorder-request");
    } catch (err) {
      console.error(err);
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to add stock reorder request" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) => `
    w-full px-4 py-3 border rounded-lg transition-all duration-200 
    bg-white disabled:bg-gray-50 disabled:text-gray-500
    focus:outline-none focus:ring-2 focus:border-transparent
    ${errors[field] 
      ? "border-red-500 focus:ring-red-200" 
      : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
    }
  `;

  const labelClass = "block mb-2 font-semibold text-gray-700 text-sm uppercase tracking-wide";
  const sectionClass = "bg-white rounded-xl p-6 shadow-sm border border-gray-200";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Stock Reorder Request</h1>
          <p className="text-gray-600">Create a new stock reorder request for inventory management</p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {errors.general}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Information */}
          <div className="lg:col-span-1">
            <div className={sectionClass}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">New Reorder Request</div>
                  <div className="text-sm text-blue-700">
                    Create a new stock reorder request for inventory replenishment.
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Select inventory and material to auto-fill details.</p>
                  <p>Fields marked with <span className="text-red-500">*</span> are required.</p>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Material and inventory details will auto-populate upon selection.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Inventory Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inventory ID */}
                  <div>
                    <label className={labelClass}>Inventory Location</label>
                    <select
                      name="inventoryId"
                      value={formData.inventoryId}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className={inputClass("inventoryId")}
                    >
                      <option value="">Select inventory</option>
                      {allInventories.map((inv) => (
                        <option key={inv._id} value={inv.inventoryId}>
                          {inv.inventoryName} ({inv.inventoryId})
                        </option>
                      ))}
                    </select>
                    {errors.inventoryId && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.inventoryId}
                      </p>
                    )}
                  </div>

                  {/* Inventory Name */}
                  <div>
                    <label className={labelClass}>Inventory Name</label>
                    <input 
                      type="text" 
                      name="inventoryName" 
                      value={formData.inventoryName} 
                      readOnly 
                      className={inputClass("inventoryName")} 
                    />
                  </div>

                  {/* Inventory Address */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Inventory Address</label>
                    <input 
                      type="text" 
                      name="inventoryAddress" 
                      value={formData.inventoryAddress} 
                      readOnly 
                      className={inputClass("inventoryAddress")} 
                    />
                  </div>

                  {/* Inventory Contact */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Inventory Contact</label>
                    <input 
                      type="text" 
                      name="inventoryContact" 
                      value={formData.inventoryContact} 
                      readOnly 
                      className={inputClass("inventoryContact")} 
                    />
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Material Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Material ID */}
                  <div>
                    <label className={labelClass}>Material</label>
                    <select 
                      name="materialId" 
                      value={formData.materialId} 
                      onChange={handleChange} 
                      required 
                      disabled={isSubmitting}
                      className={inputClass("materialId")}
                    >
                      <option value="">Select material</option>
                      {availableMaterials.map((m) => (
                        <option key={m._id} value={m.materialId}>
                          {m.materialName} ({m.materialId})
                        </option>
                      ))}
                    </select>
                    {errors.materialId && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.materialId}
                      </p>
                    )}
                  </div>

                  {/* Material Name */}
                  <div>
                    <label className={labelClass}>Material Name</label>
                    <input 
                      type="text" 
                      name="materialName" 
                      value={formData.materialName} 
                      readOnly 
                      className={inputClass("materialName")} 
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className={labelClass}>Type</label>
                    <input 
                      type="text" 
                      name="type" 
                      value={formData.type} 
                      readOnly 
                      className={inputClass("type")} 
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className={labelClass}>Unit</label>
                    <select 
                      name="unit" 
                      value={formData.unit} 
                      onChange={handleChange} 
                      required 
                      disabled={isSubmitting}
                      className={inputClass("unit")}
                    >
                      <option value="">Select unit</option>
                      {units.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Request Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div>
                    <label className={labelClass}>Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      required
                      disabled={isSubmitting}
                      className={inputClass("quantity")}
                      placeholder="Enter quantity"
                    />
                    {errors.quantity && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  {/* Expected Date */}
                  <div>
                    <label className={labelClass}>Expected Date</label>
                    <input
                      type="date"
                      name="expectedDate"
                      value={formData.expectedDate}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className={inputClass("expectedDate")}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.expectedDate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.expectedDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brown-primary hover:bg-amber-900 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Request...
                    </>
                  ) : (
                    'Add Reorder Request'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/warehouse-manager/reorder-request")}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSReorderRequestForm;