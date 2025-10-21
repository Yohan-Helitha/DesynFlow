// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../component/navbar.jsx";
// import { addDisposalMaterial,fetchDisposalMaterialsById } from "../services/FdisposalMaterialsService.js";


// const AddDisposalMaterialsForm = ({ loggedInUserId }) => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     materialId: "",
//     materialName: "",
//     inventoryName: "",
//     quantity: "",
//     unit: "",
//     reasonOfDisposal: "",
//   });

//   const [availableInventories, setAvailableInventories] = useState([]);
//   const [errors, setErrors] = useState({});

//   const units = ["pcs", "kg", "m"];

//   // 🔹 Material ID input handler
//   const handleMaterialIdInput = async (e) => {
//   const materialId = e.target.value;
//   setFormData((prev) => ({ ...prev, materialId }));

//   if (materialId) {
//     const data = await fetchDisposalMaterialsById(materialId);
//     if (data) {
//       setFormData((prev) => ({
//         ...prev,
//         materialName: data.materialName,
//         unit: data.unit,
//       }));
//       setAvailableInventories(data.inventories || []);
//     } else {
//       setFormData((prev) => ({ ...prev, materialName: "", unit: "" }));
//       setAvailableInventories([]);
//     }
//   } else {
//     setFormData((prev) => ({ ...prev, materialName: "", unit: "" }));
//     setAvailableInventories([]);
//   }
// };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleInventoryChange = (e) => {
//   const selectedId = e.target.value;
//   const selectedInv = availableInventories.find(inv => inv.inventoryId === selectedId);

//    if (!selectedInv) return;

//   setFormData(prev => ({
//     ...prev,
//     inventoryId: selectedId,
//     inventoryName: selectedInv.inventoryName, // set inventoryName too
//   }));
// };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     // 🔹 Ensure inventoryName is set
//   if (!formData.inventoryName) {
//     alert("Please select a valid inventory.");
//     return;
//   }

//     try {
//       await addDisposalMaterial({
//         ...formData,
//         requestedBy: loggedInUserId || "WM001",
//         approvedBy: "Manager001", // or get from context
//         createdAt: new Date().toISOString(),
//       });
//       alert("Disposal material added successfully!");
//       navigate("/warehouse-manager/disposal-materials");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add disposal material");
//     }
//   };

//   const inputClass = (field) =>
//     `w-full px-3 py-2 border rounded-md bg-white ${
//       errors[field] ? "border-red-500" : "border-gray-300"
//     }`;

//   return (
//     <div>
//       <Navbar />
//   <div className="m-6 flex justify-center">
//   <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
//           <h1 className="text-2xl font-bold mb-6">Add Disposal Material</h1>

//           {errors.general && <p className="text-red-600 font-semibold mb-4">{errors.general}</p>}

//           <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm ">
//             {/* Material ID */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Material ID <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="materialId"
//                 value={formData.materialId}
//                 onChange={handleMaterialIdInput}
//                 required
//                 className={inputClass("materialId")}
//                 placeholder="MP001 / RM001"
//               />
//               {errors.materialId && <p className="text-red-500 text-sm mt-1">{errors.materialId}</p>}
//             </div>

//             {/* Material Name */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Material Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="materialName"
//                 value={formData.materialName}
//                 readOnly
//                 className={inputClass("materialName")}
//               />
//               {errors.materialName && <p className="text-red-500 text-sm mt-1">{errors.materialName}</p>}
//             </div>

//             {/* Inventory */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Inventory <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="inventoryId"
//                 value={formData.inventoryId}
//                 onChange={handleInventoryChange}
//                 required
//                 className={inputClass("inventoryId")}
//               >
//                 <option value="">-- Select Inventory --</option>
//                 {availableInventories.map((inv) => (
//                   <option key={inv.inventoryId} value={inv.inventoryId}>
//                     {inv.inventoryName} ({inv.inventoryId})
//                   </option>
//                 ))}
//               </select>
//               {errors.inventoryId && <p className="text-red-500 text-sm mt-1">{errors.inventoryId}</p>}
//             </div>

//             {/* Quantity */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Quantity <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 name="quantity"
//                 value={formData.quantity}
//                 onChange={handleChange}
//                 min="1"
//                 required
//                 className={inputClass("quantity")}
//               />
//               {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
//             </div>

//             {/* Unit */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Unit <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="unit"
//                 value={formData.unit}
//                 readOnly
//                 className={inputClass("unit")}
//               />
//               {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
//             </div>

            

//             {/* Reason of Disposal */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Reason of Disposal <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="reasonOfDisposal"
//                 value={formData.reasonOfDisposal}
//                 onChange={handleChange}
//                 required
//                 className={inputClass("reasonOfDisposal")}
//               />
//               {errors.reasonOfDisposal && (
//                 <p className="text-red-500 text-sm mt-1">{errors.reasonOfDisposal}</p>
//               )}
//             </div>


//             {/* Buttons */}
//             <div className="flex gap-4 pt-6">
//               <button
//                 type="submit"
//                 className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
//               >
//                 Add Disposal Material
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate("/warehouse-manager/disposal-materials")}
//                 className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddDisposalMaterialsForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import { addDisposalMaterial, fetchDisposalMaterialsById } from "../services/FdisposalMaterialsService.js";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMaterial, setIsLoadingMaterial] = useState(false);

  const units = ["pcs", "kg", "m"];

  // 🔹 Material ID input handler
  const handleMaterialIdInput = async (e) => {
    const materialId = e.target.value;
    setFormData((prev) => ({ ...prev, materialId }));

    if (materialId) {
      setIsLoadingMaterial(true);
      try {
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
      } catch (error) {
        console.error("Error fetching material:", error);
        setFormData((prev) => ({ ...prev, materialName: "", unit: "" }));
        setAvailableInventories([]);
      } finally {
        setIsLoadingMaterial(false);
      }
    } else {
      setFormData((prev) => ({ ...prev, materialName: "", unit: "" }));
      setAvailableInventories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleInventoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedInv = availableInventories.find(inv => inv.inventoryId === selectedId);

    if (!selectedInv) return;

    setFormData(prev => ({
      ...prev,
      inventoryId: selectedId,
      inventoryName: selectedInv.inventoryName,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // 🔹 Ensure inventoryName is set
    if (!formData.inventoryName) {
      setErrors({ inventoryId: "Please select a valid inventory" });
      setIsSubmitting(false);
      return;
    }

    try {
      await addDisposalMaterial({
        ...formData,
        requestedBy: "Carol Jude",
        approvedBy: "Manager001",
        createdAt: new Date().toISOString(),
      });
      alert("Disposal material added successfully!");
      navigate("/warehouse-manager/disposal-materials");
    } catch (err) {
      console.error(err);
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to add disposal material" });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Disposal Material</h1>
          <p className="text-gray-600">Request disposal of materials from inventory with proper documentation</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Disposal Process</h2>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="font-medium text-orange-900 mb-1">Important Notice</div>
                  <div className="text-sm text-orange-700">
                    Disposal requests require manager approval and proper documentation.
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Enter the Material ID to automatically populate material details and available inventory locations.</p>
                  <p>All fields marked with <span className="text-red-500">*</span> are required.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Material Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Material ID */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Material ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="materialId"
                        value={formData.materialId}
                        onChange={handleMaterialIdInput}
                        required
                        className={inputClass("materialId")}
                        placeholder="Enter MP001 or RM001"
                      />
                      {isLoadingMaterial && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter Material ID to auto-fill details</p>
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
                      placeholder="Auto-filled from Material ID"
                    />
                    {errors.materialName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.materialName}
                      </p>
                    )}
                  </div>

                  {/* Unit */}
                  <div>
                    <label className={labelClass}>Unit</label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      readOnly
                      className={inputClass("unit")}
                      placeholder="Auto-filled from Material ID"
                    />
                    {errors.unit && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.unit}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Inventory & Quantity Section */}
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Disposal Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inventory */}
                  <div>
                    <label className={labelClass}>Inventory Location</label>
                    <select
                      name="inventoryId"
                      value={formData.inventoryId}
                      onChange={handleInventoryChange}
                      required
                      disabled={availableInventories.length === 0}
                      className={inputClass("inventoryId")}
                    >
                      <option value="">
                        {availableInventories.length === 0 ? "Enter Material ID first" : "Select inventory"}
                      </option>
                      {availableInventories.map((inv) => (
                        <option key={inv.inventoryId} value={inv.inventoryId}>
                          {inv.inventoryName} ({inv.inventoryId})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Available inventory locations for this material</p>
                    {errors.inventoryId && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.inventoryId}
                      </p>
                    )}
                  </div>

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
                      className={inputClass("quantity")}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Quantity to dispose</p>
                    {errors.quantity && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.quantity}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason for Disposal */}
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Disposal Reason</h2>
                
                <div className="max-w-2xl">
                  <label className={labelClass}>Reason for Disposal</label>
                  <input
                    type="text"
                    name="reasonOfDisposal"
                    value={formData.reasonOfDisposal}
                    onChange={handleChange}
                    required
                    className={inputClass("reasonOfDisposal")}
                    placeholder="Enter reason for disposal (e.g., damaged, expired, obsolete)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Provide detailed reason for material disposal</p>
                  {errors.reasonOfDisposal && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.reasonOfDisposal}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brown-primary hover:bg-amber-900 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center"
                >
                  {isSubmitting ?  (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Request...
                    </>
                  ) : (
                    'Submit Disposal Request'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/warehouse-manager/disposal-materials")}
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

export default AddDisposalMaterialsForm;