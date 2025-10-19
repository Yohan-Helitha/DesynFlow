// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import Navbar from "../component/navbar";
// import {
//   fetchRawMaterialById,
//   updateRawMaterial,
// } from "../services/FrawMaterialsService.js";
// import { fetchInvLocation } from "../services/FinvLocationService.js";

// const UpdateRawMaterialForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     materialName: "",
//     category: "",
//     type: "",
//     unit: "",
//     restockLevel: "",
//     reorderLevel: "",
//     currentLevel: "",
//     inventoryName: "",
//   });

//   const [locations, setLocations] = useState([]);
//   const [errors, setErrors] = useState({});

//   // Categories & Types
//   const categories = [
//     "Wood & Wood Products",
//     "Metals",
//     "Fabrics & Upholstery Materials",
//     "Flooring Materials",
//     "Glass & Mirrors",
//     "Electrical & Lighting Components",
//   ];

//   const getTypesForCategory = (category) => {
//     const categoryTypes = {
//       "Wood & Wood Products": [
//         "Solid wood (Teak, Mahogany, Oak, Pine)",
//         "Engineered wood (Plywood, MDF, Particleboard)",
//         "Veneers and laminates",
//         "Timber for structural purposes",
//       ],
//       Metals: [
//         "Stainless steel (for furniture frames, handles)",
//         "Aluminum (windows, lightweight frames)",
//         "Brass, copper, and bronze (decorative fixtures)",
//         "Iron/steel (structural and decorative)",
//       ],
//       "Fabrics & Upholstery Materials": [
//         "Cotton, Linen, Silk, Velvet, Leather",
//         "Synthetic fabrics (polyester, microfiber)",
//         "Foam, batting, and cushioning materials",
//       ],
//       "Flooring Materials": [
//         "Ceramic/porcelain tiles",
//         "Marble, granite, and natural stones",
//         "Wooden flooring / Laminates / Vinyl sheets",
//         "Carpets, rugs, and mats",
//       ],
//       "Glass & Mirrors": [
//         "Tempered glass, frosted glass",
//         "Mirrors for décor and furniture",
//         "Glass panels for partitions",
//       ],
//       "Electrical & Lighting Components": [
//         "LED strips, bulbs, and fittings",
//         "Switches, sockets, and wiring materials",
//         "Decorative lighting (pendants, chandeliers)",
//       ],
//     };

//     return categoryTypes[category] || [];
//   };

//   // Load material and locations
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const material = await fetchRawMaterialById(id);
//         if (!material) {
//           alert("Material not found");
//           return;
//         }
//         setFormData({
//           materialName: material.materialName || "",
//           category: material.category || "",
//           type: material.type || "",
//           unit: material.unit || "",
//           restockLevel: material.restockLevel || "",
//           reorderLevel: material.reorderLevel || "",
//           currentLevel: material.currentLevel || "",
//           inventoryName: material.inventoryName || "",
//         });
//       } catch (err) {
//         console.error(err);
//         alert("Failed to fetch material details");
//       }
//     };

//     const loadLocations = async () => {
//       try {
//         const data = await fetchInvLocation();
//         setLocations(data);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     loadData();
//     loadLocations();
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "category") {
//       setFormData({ ...formData, category: value, type: "" });
//     }  else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     const payload = {
//       ...formData,
//       restockLevel: Number(formData.restockLevel),
//       reorderLevel: Number(formData.reorderLevel),
//       currentLevel: Number(formData.currentLevel),
//     };

//     try {
//       await updateRawMaterial(id, payload);
//       alert("Material updated successfully!");
//       navigate("/warehouse-manager/raw-materials");
//     } catch (err) {
//       if (err.errors) {
//         setErrors(err.errors);
//       } else {
//         setErrors({ general: err.message || "Failed to update material" });
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
//           <h1 className="text-2xl font-bold mb-6">Update Raw Material</h1>

//           {errors.general && (
//             <p className="text-red-600 font-semibold mb-4">{errors.general}</p>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm">
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
//                 required
//                 className={inputClass("materialName")}
//               />
//               {errors.materialName && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.materialName}
//                 </p>
//               )}
//             </div>

//             {/* Category */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Category <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 className={inputClass("category")}
//               >
//                 <option value="">-- Select Category --</option>
//                 {categories.map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
//               </select>
//               {errors.category && (
//                 <p className="text-red-500 text-sm mt-1">{errors.category}</p>
//               )}
//             </div>

//             {/* Type */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Type <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="type"
//                 value={formData.type}
//                 onChange={handleChange}
//                 required
//                 disabled={!formData.category}
//                 className={inputClass("type")}
//               >
//                 <option value="">
//                   {formData.category
//                     ? "-- Select Type --"
//                     : "-- Select Category First --"}
//                 </option>
//                 {getTypesForCategory(formData.category).map((type) => (
//                   <option key={type} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </select>
//               {errors.type && (
//                 <p className="text-red-500 text-sm mt-1">{errors.type}</p>
//               )}
//             </div>

//             {/* Unit */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Unit of Measurement <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="unit"
//                 value={formData.unit}
//                 onChange={handleChange}
//                 required
//                 className={inputClass("unit")}
//               >
//                 <option value="">-- Select Unit --</option>
//                 <option value="pcs">pcs</option>
//                 <option value="kg">kg</option>
//                 <option value="m">m</option>
//               </select>
//               {errors.unit && (
//                 <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
//               )}
//             </div>

//             {/* Restock Level */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Restock Level <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 name="restockLevel"
//                 value={formData.restockLevel}
//                 onChange={handleChange}
//                 required
//                 min="0"
//                 className={inputClass("restockLevel")}
//               />
//               {errors.restockLevel && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.restockLevel}
//                 </p>
//               )}
//             </div>

//             {/* Reorder Level */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Reorder Level <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 name="reorderLevel"
//                 value={formData.reorderLevel}
//                 onChange={handleChange}
//                 required
//                 min="0"
//                 className={inputClass("reorderLevel")}
//               />
//               {errors.reorderLevel && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.reorderLevel}
//                 </p>
//               )}
//             </div>

//             {/* Current Level */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Current Stock Level <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 name="currentLevel"
//                 value={formData.currentLevel}
//                 onChange={handleChange}
//                 required
//                 min="0"
//                 className={inputClass("currentLevel")}
//               />
//               {errors.currentLevel && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.currentLevel}
//                 </p>
//               )}
//             </div>

//             {/* Inventory Location */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Inventory Location <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="inventoryName"
//                 value={formData.inventoryName}
//                 onChange={handleChange}
//                 required
//                 className={inputClass("inventoryName")}
//               >
//                 <option value="">-- Select Inventory Location --</option>
//                 {locations.map((loc) => (
//                   <option key={loc.inventoryId} value={loc.inventoryName}>
//                     {loc.inventoryName}
//                   </option>
//                 ))}
//               </select>
//               {errors.inventoryName && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.inventoryName}
//                 </p>
//               )}
//             </div>

//             {/* Buttons */}
//             <div className="flex gap-4 pt-6">
//               <button
//                 type="submit"
//                 className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
//               >
//                 Update Material
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate("/warehouse-manager/raw-materials")}
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

// export default UpdateRawMaterialForm;

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../component/navbar";
import {
  fetchRawMaterialById,
  updateRawMaterial,
} from "../services/FrawMaterialsService.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";

const UpdateRawMaterialForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialName: "",
    category: "",
    type: "",
    unit: "",
    restockLevel: "",
    reorderLevel: "",
    currentLevel: "",
    inventoryName: "",
  });

  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Categories & Types
  const categories = [
    "Wood & Wood Products",
    "Metals",
    "Fabrics & Upholstery Materials",
    "Flooring Materials",
    "Glass & Mirrors",
    "Electrical & Lighting Components",
  ];

  const getTypesForCategory = (category) => {
    const categoryTypes = {
      "Wood & Wood Products": [
        "Solid wood (Teak, Mahogany, Oak, Pine)",
        "Engineered wood (Plywood, MDF, Particleboard)",
        "Veneers and laminates",
        "Timber for structural purposes",
      ],
      Metals: [
        "Stainless steel (for furniture frames, handles)",
        "Aluminum (windows, lightweight frames)",
        "Brass, copper, and bronze (decorative fixtures)",
        "Iron/steel (structural and decorative)",
      ],
      "Fabrics & Upholstery Materials": [
        "Cotton, Linen, Silk, Velvet, Leather",
        "Synthetic fabrics (polyester, microfiber)",
        "Foam, batting, and cushioning materials",
      ],
      "Flooring Materials": [
        "Ceramic/porcelain tiles",
        "Marble, granite, and natural stones",
        "Wooden flooring / Laminates / Vinyl sheets",
        "Carpets, rugs, and mats",
      ],
      "Glass & Mirrors": [
        "Tempered glass, frosted glass",
        "Mirrors for décor and furniture",
        "Glass panels for partitions",
      ],
      "Electrical & Lighting Components": [
        "LED strips, bulbs, and fittings",
        "Switches, sockets, and wiring materials",
        "Decorative lighting (pendants, chandeliers)",
      ],
    };

    return categoryTypes[category] || [];
  };

  // Load material and locations
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [material, locData] = await Promise.all([
          fetchRawMaterialById(id),
          fetchInvLocation()
        ]);
        
        if (!material) {
          alert("Material not found");
          navigate("/warehouse-manager/raw-materials");
          return;
        }
        
        setFormData({
          materialName: material.materialName || "",
          category: material.category || "",
          type: material.type || "",
          unit: material.unit || "",
          restockLevel: material.restockLevel || "",
          reorderLevel: material.reorderLevel || "",
          currentLevel: material.currentLevel || "",
          inventoryName: material.inventoryName || "",
        });
        
        setLocations(locData);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch material details");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      setFormData({ ...formData, category: value, type: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const payload = {
      ...formData,
      restockLevel: Number(formData.restockLevel),
      reorderLevel: Number(formData.reorderLevel),
      currentLevel: Number(formData.currentLevel),
    };

    try {
      await updateRawMaterial(id, payload);
      alert("Material updated successfully!");
      navigate("/warehouse-manager/raw-materials");
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to update material" });
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Update Raw Material</h1>
          <p className="text-gray-600">Update existing raw material information in your inventory management system</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Material Details</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">Editing Material</div>
                  <div className="text-sm text-blue-700">You are updating an existing raw material in the system.</div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Make necessary changes to the material information and stock levels.</p>
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
                  {/* Material Name */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Material Name</label>
                    <input
                      type="text"
                      name="materialName"
                      value={formData.materialName}
                      onChange={handleChange}
                      required
                      className={inputClass("materialName")}
                      placeholder="Enter material name"
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

                  {/* Category and Type */}
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className={inputClass("category")}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      disabled={!formData.category}
                      className={inputClass("type")}
                    >
                      <option value="">
                        {formData.category ? "Select type" : "Select category first"}
                      </option>
                      {getTypesForCategory(formData.category).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.type}
                      </p>
                    )}
                  </div>

                  {/* Unit */}
                  <div>
                    <label className={labelClass}>Unit of Measurement</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                      className={inputClass("unit")}
                    >
                      <option value="">Select unit</option>
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="m">m</option>
                    </select>
                    {errors.unit && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.unit}
                      </p>
                    )}
                  </div>

                  {/* Empty div for grid alignment */}
                  <div></div>
                </div>
              </div>

              {/* Stock Levels Section */}
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Stock Management</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>Restock Level</label>
                    <input
                      type="number"
                      name="restockLevel"
                      value={formData.restockLevel}
                      onChange={handleChange}
                      required
                      min="0"
                      className={inputClass("restockLevel")}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Target stock level</p>
                    {errors.restockLevel && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.restockLevel}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Reorder Level</label>
                    <input
                      type="number"
                      name="reorderLevel"
                      value={formData.reorderLevel}
                      onChange={handleChange}
                      required
                      min="0"
                      className={inputClass("reorderLevel")}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Trigger point for reordering</p>
                    {errors.reorderLevel && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.reorderLevel}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Current Level</label>
                    <input
                      type="number"
                      name="currentLevel"
                      value={formData.currentLevel}
                      onChange={handleChange}
                      required
                      min="0"
                      className={inputClass("currentLevel")}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current stock quantity</p>
                    {errors.currentLevel && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.currentLevel}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Inventory Location */}
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Inventory Location</h2>
                
                <div className="max-w-md">
                  <label className={labelClass}>Select Location</label>
                  <select
                    name="inventoryName"
                    value={formData.inventoryName}
                    onChange={handleChange}
                    required
                    className={inputClass("inventoryName")}
                  >
                    <option value="">Choose inventory location</option>
                    {locations.map((loc) => (
                      <option key={loc.inventoryId} value={loc.inventoryName}>
                        {loc.inventoryName}
                      </option>
                    ))}
                  </select>
                  {errors.inventoryName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.inventoryName}
                    </p>
                  )}
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
                      Updating Material...
                    </>
                  ) : (
                    'Update Material'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/warehouse-manager/raw-materials")}
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

export default UpdateRawMaterialForm;