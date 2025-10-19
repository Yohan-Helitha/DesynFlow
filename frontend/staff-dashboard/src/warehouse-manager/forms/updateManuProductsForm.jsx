// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import Navbar from '../component/navbar';
// import { fetchManuProductById, updateManuProduct } from '../services/FmanuProductsService.js';
// import { fetchInvLocation } from "../services/FinvLocationService.js";

// const UpdateManuProductForm = ({ loggedInUserId }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     materialName: '',
//     category: '',
//     type: '',
//     unit: '',
//     restockLevel: '',
//     reorderLevel: '',
//     currentLevel: '',
//     warrantyPeriod: '',
//     inventoryName: ''
//   });

//   const [locations, setLocations] = useState([]);
//   const [errors, setErrors] = useState({});

//   const categories = ['Furniture', 'Lighting', 'Window Treatments', 'Kitchen & Bathroom', 'Decorative Accessories'];

//   const getTypesForCategory = (category) => {
//     const categoryTypes = {
//       'Furniture': ['Sofas & Armchairs','Tables (Dining, Coffee, Side)','Chairs & Stools','Beds & Mattresses','Cabinets & Storage Units','Shelving & Bookcases'],
//       'Lighting': ['Ceiling Lights (Chandeliers, Pendant Lights)','Wall Lights & Sconces','Table & Floor Lamps','LED Strips & Spotlights'],
//       'Window Treatments': ['Curtains & Drapes','Blinds & Shades','Curtain Rods & Accessories'],
//       'Kitchen & Bathroom': ['Countertops (Granite, Quartz, Marble)','Cabinets & Pantry Units','Sinks & Faucets','Bathroom Fixtures (Showers, Tubs, Toilets)'],
//       'Decorative Accessories': ['Mirrors','Wall Art & Frames','Vases & Planters','Decorative Lighting']
//     };
//     return categoryTypes[category] || [];
//   };

//   useEffect(() => {
//     // Load inventory locations
//     const loadLocations = async () => {
//       const data = await fetchInvLocation();
//       setLocations(data);
//     };

//     // Fetch product by ID
//     const getProduct = async () => {
//       try {
//         const data = await fetchManuProductById(id);
//         if (!data) {
//           alert('Product not found');
//           return;
//         }
//         setFormData({
//           materialName: data.materialName || '',
//           category: data.category || '',
//           type: data.type || '',
//           unit: data.unit || '',
//           restockLevel: data.restockLevel || '',
//           reorderLevel: data.reorderLevel || '',
//           currentLevel: data.currentLevel || '',
//           warrantyPeriod: data.warrantyPeriod || '',
//           inventoryName: data.inventoryName || ''
//         });
//       } catch (err) {
//         console.error(err);
//         alert('Failed to fetch product details');
//       }
//     };

//     loadLocations();
//     getProduct();
//   }, [id]);

//   const handleChange = (e) => {
//   const { name, value } = e.target;

//   if (name === 'category') {
//     setFormData({ ...formData, category: value, type: '' });
//   } else {
//     setFormData({ ...formData, [name]: value });
//   }
// };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     const now = new Date();
//     const monthNames = ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];

//     const payload = {
//       ...formData,
//       restockLevel: Number(formData.restockLevel),
//       reorderLevel: Number(formData.reorderLevel),
//       currentLevel: Number(formData.currentLevel),
//       updatedBy: loggedInUserId || "WM001",
//       month: monthNames[now.getMonth()],
//       year: now.getFullYear(),
//       updatedAt: now.toISOString()
//     };

//     try {
//       await updateManuProduct(id, payload);
//       alert('Product updated successfully!');
//       navigate('/warehouse-manager/manufactured-products');
//     } catch (err) {
//       if (err.errors) {
//         setErrors(err.errors);
//       } else {
//         setErrors({ general: err.message || "Failed to update product" });
//       }
//     }
//   };

//   const inputClass = (field) => `w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 ${
//     errors[field] ? "border-red-500" : "border-gray-300"
//   }`;

//   return (
//     <div>
//       <Navbar />
//   <div className="m-6 flex justify-center">
//   <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
//           <h1 className="text-2xl font-bold mb-6">Update Manufactured Product</h1>

//           {errors.general && <p className="text-red-600 font-semibold mb-4">{errors.general}</p>}

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
//                 className={inputClass('materialName')}
//               />
//               {errors.materialName && <p className="text-red-500 text-sm mt-1">{errors.materialName}</p>}
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
//                 className={inputClass('category')}
//               >
//                 <option value="">-- Select Category --</option>
//                 {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//               </select>
//               {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
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
//                 className={inputClass('type')}
//               >
//                 <option value="">{formData.category ? "-- Select Type --" : "-- Select Category First --"}</option>
//                 {getTypesForCategory(formData.category).map(type => <option key={type} value={type}>{type}</option>)}
//               </select>
//               {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
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
//                 className={inputClass('unit')}
//               >
//                 <option value="">-- Select Unit --</option>
//                 <option value="pcs">pcs</option>
//                 <option value="kg">kg</option>
//                 <option value="m">m</option>
//               </select>
//               {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
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
//                 className={inputClass('restockLevel')}
//               />
//               {errors.restockLevel && <p className="text-red-500 text-sm mt-1">{errors.restockLevel}</p>}
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
//                 className={inputClass('reorderLevel')}
//               />
//               {errors.reorderLevel && <p className="text-red-500 text-sm mt-1">{errors.reorderLevel}</p>}
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
//                 className={inputClass('currentLevel')}
//               />
//               {errors.currentLevel && <p className="text-red-500 text-sm mt-1">{errors.currentLevel}</p>}
//             </div>

//             {/* Warranty Period */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Warranty Period <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="warrantyPeriod"
//                 value={formData.warrantyPeriod}
//                 onChange={handleChange}
//                 required
//                 className={inputClass('warrantyPeriod')}
//               />
//               {errors.warrantyPeriod && <p className="text-red-500 text-sm mt-1">{errors.warrantyPeriod}</p>}
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
//                 className={inputClass('inventoryName')}
//               >
//                 <option value="">-- Select Inventory Location --</option>
//                 {locations.map(loc => <option key={loc.inventoryId} value={loc.inventoryName}>{loc.inventoryName}</option>)}
//               </select>
//               {errors.inventoryName && <p className="text-red-500 text-sm mt-1">{errors.inventoryName}</p>}
//             </div>

//             {/* Buttons */}
//             <div className="flex gap-4 pt-6">
//               <button
//                 type="submit"
//                 className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
//               >
//                 Update Product
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate("/warehouse-manager/manufactured-products")}
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

// export default UpdateManuProductForm;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../component/navbar';
import { fetchManuProductById, updateManuProduct } from '../services/FmanuProductsService.js';
import { fetchInvLocation } from "../services/FinvLocationService.js";

const UpdateManuProductForm = ({ loggedInUserId }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    materialName: '',
    category: '',
    type: '',
    unit: '',
    restockLevel: '',
    reorderLevel: '',
    currentLevel: '',
    warrantyPeriod: '',
    inventoryName: ''
  });

  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['Furniture', 'Lighting', 'Window Treatments', 'Kitchen & Bathroom', 'Decorative Accessories'];

  const getTypesForCategory = (category) => {
    const categoryTypes = {
      'Furniture': ['Sofas & Armchairs','Tables (Dining, Coffee, Side)','Chairs & Stools','Beds & Mattresses','Cabinets & Storage Units','Shelving & Bookcases'],
      'Lighting': ['Ceiling Lights (Chandeliers, Pendant Lights)','Wall Lights & Sconces','Table & Floor Lamps','LED Strips & Spotlights'],
      'Window Treatments': ['Curtains & Drapes','Blinds & Shades','Curtain Rods & Accessories'],
      'Kitchen & Bathroom': ['Countertops (Granite, Quartz, Marble)','Cabinets & Pantry Units','Sinks & Faucets','Bathroom Fixtures (Showers, Tubs, Toilets)'],
      'Decorative Accessories': ['Mirrors','Wall Art & Frames','Vases & Planters','Decorative Lighting']
    };
    return categoryTypes[category] || [];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productData, locData] = await Promise.all([
          fetchManuProductById(id),
          fetchInvLocation()
        ]);
        
        if (!productData) {
          alert('Product not found');
          navigate('/warehouse-manager/manufactured-products');
          return;
        }
        
        setFormData({
          materialName: productData.materialName || '',
          category: productData.category || '',
          type: productData.type || '',
          unit: productData.unit || '',
          restockLevel: productData.restockLevel || '',
          reorderLevel: productData.reorderLevel || '',
          currentLevel: productData.currentLevel || '',
          warrantyPeriod: productData.warrantyPeriod || '',
          inventoryName: productData.inventoryName || ''
        });
        
        setLocations(locData);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch product details');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'category') {
      setFormData({ ...formData, category: value, type: '' });
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

    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];

    const payload = {
      ...formData,
      restockLevel: Number(formData.restockLevel),
      reorderLevel: Number(formData.reorderLevel),
      currentLevel: Number(formData.currentLevel),
      updatedBy: loggedInUserId || "WM001",
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
      updatedAt: now.toISOString()
    };

    try {
      await updateManuProduct(id, payload);
      alert('Product updated successfully!');
      navigate('/warehouse-manager/manufactured-products');
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to update product" });
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Update Manufactured Product</h1>
          <p className="text-gray-600">Update existing manufactured product information in your inventory management system</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">Editing Product</div>
                  <div className="text-sm text-blue-700">You are updating an existing manufactured product in the system.</div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Make necessary changes to the product information and stock levels.</p>
                  <p>All fields marked with <span className="text-red-500">*</span> are required.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Information</h2>
                
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
                      className={inputClass('materialName')}
                      placeholder="Enter product name"
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
                      className={inputClass('category')}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                      className={inputClass('type')}
                    >
                      <option value="">{formData.category ? "Select type" : "Select category first"}</option>
                      {getTypesForCategory(formData.category).map(type => <option key={type} value={type}>{type}</option>)}
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

                  {/* Unit and Warranty */}
                  <div>
                    <label className={labelClass}>Unit of Measurement</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                      className={inputClass('unit')}
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

                  <div>
                    <label className={labelClass}>Warranty Period</label>
                    <input
                      type="text"
                      name="warrantyPeriod"
                      value={formData.warrantyPeriod}
                      onChange={handleChange}
                      required
                      className={inputClass('warrantyPeriod')}
                      placeholder="e.g., 2 years"
                    />
                    {errors.warrantyPeriod && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.warrantyPeriod}
                      </p>
                    )}
                  </div>
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
                      className={inputClass('restockLevel')}
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
                      className={inputClass('reorderLevel')}
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
                      className={inputClass('currentLevel')}
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
                    className={inputClass('inventoryName')}
                  >
                    <option value="">Choose inventory location</option>
                    {locations.map(loc => <option key={loc.inventoryId} value={loc.inventoryName}>{loc.inventoryName}</option>)}
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
                  className="bg-brown-primary hover:bg-amber-900 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Product...
                    </>
                  ) : (
                    'Update Product'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/warehouse-manager/manufactured-products")}
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

export default UpdateManuProductForm;