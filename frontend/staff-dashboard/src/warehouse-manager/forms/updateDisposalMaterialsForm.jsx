// import React, { useState, useEffect } from "react";
// import Navbar from "../component/navbar.jsx";
// import { useNavigate, useParams } from "react-router-dom";
// import { fetchDisposalRecordById, updateDisposalMaterial } from "../services/FdisposalMaterialsService.js";

// const UpdateDisposalMaterialsForm = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   const [formData, setFormData] = useState({
//     materialId: "",
//     materialName: "",
//     inventoryId: "",
//     inventoryName: "",
//     quantity: "",
//     unit: "",
//     reasonOfDisposal: "",
//   });

//   const [errors, setErrors] = useState({});

//   // 🔹 Add same inputClass function like Add form
//   const inputClass = (field) =>
//     `w-full px-3 py-2 border rounded-md bg-white ${
//       errors[field] ? "border-red-500" : "border-gray-300"
//     }`;

//   // 🔹 Fetch record by ID
//   useEffect(() => {
//     const getData = async () => {
//       try {
//         const data = await fetchDisposalRecordById(id);
//         console.log("Fetched disposal record:", data);

//         if (data) {
//           const d = data.disposal_material || data; // support both shapes
//           setFormData({
//             materialId: d.materialId || "",
//             materialName: d.materialName || "",
//             inventoryId: d.inventoryId || "",
//             inventoryName: d.inventoryName || "",
//             quantity: d.quantity || "",
//             unit: d.unit || "",
//             reasonOfDisposal: d.reasonOfDisposal || "",
//           });
//         }
//       } catch (err) {
//         console.error("Failed to fetch record:", err);
//         setErrors({ general: "Failed to load disposal record." });
//       }
//     };
//     getData();
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     // 🔹 Validation like Add form
//     const newErrors = {};
//     if (!formData.materialId) newErrors.materialId = "Material ID is required";
//     if (!formData.materialName) newErrors.materialName = "Material Name is required";
//     if (!formData.inventoryName) newErrors.inventoryName = "Inventory is required";
//     if (!formData.quantity || formData.quantity <= 0)
//       newErrors.quantity = "Quantity must be greater than 0";
//     if (!formData.unit) newErrors.unit = "Unit is required";
//     if (!formData.reasonOfDisposal) newErrors.reasonOfDisposal = "Reason is required";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     try {
//       await updateDisposalMaterial(id, formData);
//       alert("Disposal material updated successfully!");
//       navigate("/warehouse-manager/disposal-materials");
//     } catch (err) {
//       console.error("Update error:", err);
//       setErrors({ general: "Failed to update disposal material." });
//     }
//   };

//   return (
//     <div>
//       <Navbar />
//   <div className="m-6 flex justify-center">
//   <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
//           <h1 className="text-2xl font-bold mb-6">Update Disposal Material</h1>

//           {errors.general && (
//             <p className="text-red-600 font-semibold mb-4">{errors.general}</p>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm">
//             {/* Material ID */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Material ID <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="materialId"
//                 value={formData.materialId}
//                 readOnly
//                 className={inputClass("materialId")}
//               />
//               {errors.materialId && (
//                 <p className="text-red-500 text-sm mt-1">{errors.materialId}</p>
//               )}
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
//                 onChange={handleChange}
//                 readOnly
//                 className={inputClass("materialName")}
//               />
//               {errors.materialName && (
//                 <p className="text-red-500 text-sm mt-1">{errors.materialName}</p>
//               )}
//             </div>

//             {/* Inventory */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Inventory <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="inventoryId"
//                 value={formData.inventoryName}
//                 onChange={handleChange}
//                 readOnly
//                 className={inputClass("inventoryId")}
//               />
//               {errors.inventoryId && (
//                 <p className="text-red-500 text-sm mt-1">{errors.inventoryId}</p>
//               )}
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
//                 required
//                 min="1"
//                 className={inputClass("quantity")}
//               />
//               {errors.quantity && (
//                 <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
//               )}
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
//               {errors.unit && (
//                 <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
//               )}
//             </div>

//             {/* Reason Of Disposal */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Reason Of Disposal <span className="text-red-500">*</span>
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
//                 Update
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

// export default UpdateDisposalMaterialsForm;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Fetch record by ID
  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
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
        } else {
          setErrors({ general: "Disposal record not found" });
        }
      } catch (err) {
        console.error("Failed to fetch record:", err);
        setErrors({ general: "Failed to load disposal record." });
      } finally {
        setIsLoading(false);
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // 🔹 Validation
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
      setIsSubmitting(false);
      return;
    }

    try {
      await updateDisposalMaterial(id, formData);
      alert("Disposal material updated successfully!");
      navigate("/warehouse-manager/disposal-materials");
    } catch (err) {
      console.error("Update error:", err);
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to update disposal material." });
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Update Disposal Material</h1>
          <p className="text-gray-600">Update existing disposal material request information</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Details</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">Editing Disposal Request</div>
                  <div className="text-sm text-blue-700">
                    You are updating an existing disposal material request.
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Update the quantity or reason for disposal as needed.</p>
                  <p>Fields marked with <span className="text-red-500">*</span> are required.</p>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Material ID, Name, and Unit cannot be modified.</p>
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
                  <div>
                    <label className={labelClass}>Material ID</label>
                    <input
                      type="text"
                      name="materialId"
                      value={formData.materialId}
                      readOnly
                      className={inputClass("materialId")}
                    />
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
                    {errors.materialName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.materialName}
                      </p>
                    )}
                  </div>

                  {/* Inventory */}
                  <div>
                    <label className={labelClass}>Inventory Location</label>
                    <input
                      type="text"
                      name="inventoryName"
                      value={formData.inventoryName}
                      readOnly
                      className={inputClass("inventoryName")}
                    />
                    {errors.inventoryName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.inventoryName}
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

              {/* Disposal Details Section */}
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Disposal Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div>
                    <label className={labelClass}>Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="1"
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

                  {/* Empty div for grid alignment */}
                  <div></div>
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
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Request...
                    </>
                  ) : (
                    'Update Disposal Request'
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

export default UpdateDisposalMaterialsForm;