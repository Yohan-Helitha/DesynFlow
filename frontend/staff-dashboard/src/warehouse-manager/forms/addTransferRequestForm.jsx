// // src/pages/addTransferRequestForm.jsx

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../component/navbar.jsx";
// import { addTransferRequest } from "../services/FtransferRequestService.js";
// import { fetchInvLocation } from "../services/FinvLocationService.js";
// import { fetchRawMaterial } from "../services/FrawMaterialsService.js";
// import { fetchManuProducts } from "../services/FmanuProductsService.js";

// const AddTransferRequestForm = ({ loggedInUserId }) => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     materialId: "",
//     fromLocation: "",
//     toLocation: "",
//     quantity: "",
//     reason: "",
//     requiredBy: "",
//   });

//   const [fromLocations, setFromLocations] = useState([]);
//   const [allLocations, setAllLocations] = useState([]);
//   const [errors, setErrors] = useState({});


//   // 🔹 Fetch locations and filter based on material
//   useEffect(() => {
//     const getLocationsForMaterial = async () => {
//       try {
//         const allInventories = await fetchInvLocation();
//         setAllLocations(allInventories); // for To Location

//         if (!formData.materialId) {
//           setFromLocations([]);
//           return;
//         }

//         const [rawMaterials, manuProducts] = await Promise.all([
//           fetchRawMaterial(),
//           fetchManuProducts(),
//         ]);

//         const rawInvNames = rawMaterials
//           .filter((rm) => rm.materialId === formData.materialId)
//           .map((rm) => rm.inventoryName);

//         const manuInvNames = manuProducts
//           .filter((mp) => mp.materialId === formData.materialId)
//           .map((mp) => mp.inventoryName);

//         const validFromInvNames = [...new Set([...rawInvNames, ...manuInvNames])];

//         const filteredFrom = allInventories.filter((inv) =>
//           validFromInvNames.includes(inv.inventoryName)
//         );

//         setFromLocations(filteredFrom);
//       } catch (err) {
//         console.error("Failed to fetch locations:", err);
//       }
//     };

//     getLocationsForMaterial();
//   }, [formData.materialId]);

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

//     const payload = {
//       ...formData,
//       Status: "Pending",
//       createdBy: loggedInUserId || "WM001",
//       approvedBy: "",
//     };

//     try {
//       await addTransferRequest(payload);
//       alert("Transfer Request added successfully!");
//       navigate("/warehouse-manager/transfer-request");
//     } catch (err) {
//       if (err.errors) {
//         setErrors(err.errors);
//       } else {
//         setErrors({ general: err.message || "Failed to add transfer request" });
//       }
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
//           <h1 className="text-2xl font-bold mb-6">Add Transfer Request</h1>

//           {errors.general && (
//             <p className="text-red-600 font-semibold mb-4">{errors.general}</p>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4 text-sm max-w-3xl">
//             {/* Material ID */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Material ID <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="materialId"
//                 value={formData.materialId}
//                 onChange={handleChange}
//                 required
//                 className={inputClass("materialId")}
//               />
//               {errors.materialId && (
//                 <p className="text-red-500 text-sm mt-1">{errors.materialId}</p>
//               )}
//             </div>

//             {/* From Location */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 From Location <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="fromLocation"
//                 value={formData.fromLocation}
//                 onChange={handleChange}
//                 required
//                 className={inputClass("fromLocation")}
//               >
//                 <option value="">-- Select From Location --</option>
//                 {fromLocations.map((loc) => (
//                   <option key={loc._id} value={loc.inventoryName}>
//                     {loc.inventoryName} ({loc.inventoryId})
//                   </option>
//                 ))}
//               </select>
//               {errors.fromLocation && (
//                 <p className="text-red-500 text-sm mt-1">{errors.fromLocation}</p>
//               )}
//             </div>

//             {/* To Location */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 To Location <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="toLocation"
//                 value={formData.toLocation}
//                 onChange={handleChange}
//                 required
//                 className={inputClass("toLocation")}
//               >
//                 <option value="">-- Select To Location --</option>
//                 {allLocations
//                   .filter((loc) => loc.inventoryName !== formData.fromLocation)
//                   .map((loc) => (
//                     <option key={loc._id} value={loc.inventoryName}>
//                       {loc.inventoryName} ({loc.inventoryId})
//                     </option>
//                   ))}
//               </select>
//               {errors.toLocation && (
//                 <p className="text-red-500 text-sm mt-1">{errors.toLocation}</p>
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

//             {/* Reason */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Reason <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="reason"
//                 value={formData.reason}
//                 onChange={handleChange}
//                 required
//                 className={inputClass("reason")}
//               />
//               {errors.reason && (
//                 <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
//               )}
//             </div>

//             {/* Required By*/}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Required By <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 name="requiredBy"
//                 value={formData.requiredBy}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                 min={new Date().toISOString().split("T")[0]} // <-- Only future dates allowed
//               />
//               {errors.requiredBy && (
//                 <p className="text-red-500 text-sm mt-1">{errors.requiredBy}</p>
//               )}
//             </div>

//             {/* Buttons */}
//             <div className="flex gap-4 pt-6">
//               <button
//                 type="submit"
//                 className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
//               >
//                 Add Transfer Request
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate("/warehouse-manager/transfer-request")}
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

// export default AddTransferRequestForm;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import { addTransferRequest } from "../services/FtransferRequestService.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";
import { fetchRawMaterial } from "../services/FrawMaterialsService.js";
import { fetchManuProducts } from "../services/FmanuProductsService.js";

const AddTransferRequestForm = ({ loggedInUserId }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialId: "",
    fromLocation: "",
    toLocation: "",
    quantity: "",
    reason: "",
    requiredBy: "",
  });

  const [fromLocations, setFromLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Fetch all locations and materials
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [allInventories, rawMaterials, manuProducts] = await Promise.all([
          fetchInvLocation(),
          fetchRawMaterial(),
          fetchManuProducts(),
        ]);

        setAllLocations(allInventories || []);
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

  // 🔹 Filter from locations based on selected material
  useEffect(() => {
    const getLocationsForMaterial = async () => {
      if (!formData.materialId) {
        setFromLocations([]);
        return;
      }

      try {
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
        const filteredFrom = allLocations.filter((inv) =>
          validFromInvNames.includes(inv.inventoryName)
        );

        setFromLocations(filteredFrom);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };

    getLocationsForMaterial();
  }, [formData.materialId, allLocations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
    if (!formData.materialId) newErrors.materialId = "Material ID is required";
    if (!formData.fromLocation) newErrors.fromLocation = "From Location is required";
    if (!formData.toLocation) newErrors.toLocation = "To Location is required";
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Valid quantity is required";
    if (!formData.reason) newErrors.reason = "Reason is required";
    if (!formData.requiredBy) newErrors.requiredBy = "Required By date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...formData,
      Status: "Pending",
      createdBy: loggedInUserId || "WM001",
      approvedBy: "",
    };

    try {
      await addTransferRequest(payload);
      alert("Transfer Request added successfully!");
      navigate("/warehouse-manager/transfer-request");
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to add transfer request" });
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Transfer Request</h1>
          <p className="text-gray-600">Create a new transfer request for inventory movement between locations</p>
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
                  <div className="font-medium text-blue-900 mb-1">New Transfer Request</div>
                  <div className="text-sm text-blue-700">
                    Create a new transfer request for moving inventory between warehouse locations.
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">From locations are filtered based on selected material.</p>
                  <p>Fields marked with <span className="text-red-500">*</span> are required.</p>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Transfer requests require approval before processing.</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-yellow-800 text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Status
                  </div>
                  <p className="text-yellow-700 text-xs mt-1">
                    New requests are created with "Pending" status and require approval.
                  </p>
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
                    <label className={labelClass}>
                      Material ID <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="materialId"
                      value={formData.materialId}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className={inputClass("materialId")}
                    >
                      <option value="">-- Select Material --</option>
                      {availableMaterials.map((material) => (
                        <option key={material.materialId} value={material.materialId}>
                          {material.materialName} ({material.materialId})
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
                </div>
              </div>

              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Location Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From Location */}
                  <div>
                    <label className={labelClass}>
                      From Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="fromLocation"
                      value={formData.fromLocation}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || !formData.materialId}
                      className={inputClass("fromLocation")}
                    >
                      <option value="">-- Select From Location --</option>
                      {fromLocations.map((loc) => (
                        <option key={loc.inventoryId} value={loc.inventoryName}>
                          {loc.inventoryName} ({loc.inventoryId})
                        </option>
                      ))}
                    </select>
                    {errors.fromLocation && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.fromLocation}
                      </p>
                    )}
                  </div>

                  {/* To Location */}
                  <div>
                    <label className={labelClass}>
                      To Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="toLocation"
                      value={formData.toLocation}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className={inputClass("toLocation")}
                    >
                      <option value="">-- Select To Location --</option>
                      {allLocations
                        .filter((loc) => loc.inventoryName !== formData.fromLocation)
                        .map((loc) => (
                          <option key={loc.inventoryId} value={loc.inventoryName}>
                            {loc.inventoryName} ({loc.inventoryId})
                          </option>
                        ))}
                    </select>
                    {errors.toLocation && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.toLocation}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Request Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div>
                    <label className={labelClass}>
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="1"
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

                  {/* Required By */}
                  <div>
                    <label className={labelClass}>
                      Required By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="requiredBy"
                      value={formData.requiredBy}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className={inputClass("requiredBy")}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.requiredBy && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.requiredBy}
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className={inputClass("reason")}
                      placeholder="Enter reason for transfer"
                    />
                    {errors.reason && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.reason}
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
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center"
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
                    'Add Transfer Request'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/warehouse-manager/transfer-request")}
                  disabled={isSubmitting}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
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

export default AddTransferRequestForm;