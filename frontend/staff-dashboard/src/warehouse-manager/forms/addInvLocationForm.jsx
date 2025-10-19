// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Navbar from '../component/navbar.jsx';
// import { addInvLocation, fetchInvLocation } from "../services/FinvLocationService.js";

// const countryPhoneRules = {
//   "Sri Lanka": { code: "+94", digits: 9 },
//   "USA": { code: "+1", digits: 10 },
//   "India": { code: "+91", digits: 10 },
//   "UK": { code: "+44", digits: 10 },
//   "Germany": { code: "+49", digits: 10 },
//   "Canada": { code: "+1", digits: 10 }
// };

// const AddInvLocationForm = ({ loggedInUserId }) => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     inventoryName: '',
//     inventoryAddress: '',
//     country: '',
//     capacity: '',
//     inventoryContact: '',
//     warehouseManagerName: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [locations, setLocations] = useState([]);

//   useEffect(() => {
//     const loadLocations = async () => {
//       const data = await fetchInvLocation();
//       setLocations(data);
//     };
//     loadLocations();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Only allow numbers for capacity and contact (excluding country code)
//     if (name === 'capacity') {
//       if (!/^\d*$/.test(value)) return;
//     }
//     if (name === 'inventoryContact') {
//       if (!/^\d*$/.test(value.replace(/^\+?\d*/, ''))) return;
//     }

//     let updatedData = { ...formData, [name]: value };

//     // Auto-fill country code for contact when country changes
//     if (name === 'country') {
//       const rule = countryPhoneRules[value];
//       if (rule) {
//         // Remove old country code if present
//         const contactNumber = formData.inventoryContact.replace(/^\+\d+/, '');
//         updatedData.inventoryContact = rule.code + contactNumber;
//       }
//     }

//     setFormData(updatedData);
//   };

//   const validateForm = () => {
//     const errs = {};
//     const { inventoryName, inventoryAddress, country, capacity, inventoryContact, warehouseManagerName } = formData;

//     // Required
//     if (!inventoryName.trim()) errs.inventoryName = "Inventory name is required";
//     if (!inventoryAddress.trim()) errs.inventoryAddress = "Inventory address is required";
//     if (!country.trim()) errs.country = "Country is required";
//     if (!capacity) errs.capacity = "Capacity is required";
//     if (!inventoryContact.trim()) errs.inventoryContact = "Contact is required";
//     if (!warehouseManagerName.trim()) errs.warehouseManagerName = "Warehouse manager is required";

//     // Capacity numeric
//     if (capacity && isNaN(Number(capacity))) errs.capacity = "Capacity must be a number";

//     // Contact validation
//     // Contact validation
// if (country && inventoryContact) {
//   const rule = countryPhoneRules[country];
//   if (rule) {
//     const contactNumber = inventoryContact.replace(/\D/g, ''); // keep only numbers
//     const expectedLength = rule.code.replace("+", "").length + rule.digits; // code length + local digits

//     if (contactNumber.length !== expectedLength) {
//       errs.inventoryContact = `Contact number must be ${expectedLength} digits including country code for ${country}`;
//     }

//     // Ensure it starts with correct code
//     if (!contactNumber.startsWith(rule.code.replace("+", ""))) {
//       errs.inventoryContact = `Contact must start with ${rule.code}`;
//     }
//   }
// }


//     // Check duplicates locally
//     locations.forEach(loc => {
//       if (loc.inventoryName === inventoryName) errs.inventoryName = "Inventory name already exists";
//       if (loc.inventoryAddress === inventoryAddress) errs.inventoryAddress = "Inventory address already exists";
//       if (loc.inventoryContact === inventoryContact) errs.inventoryContact = "Contact already exists";
//     });

//     return errs;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errs = validateForm();
//     setErrors(errs);
//     if (Object.keys(errs).length > 0) return;

//     const now = new Date();
//     const payload = { ...formData, createdBy: loggedInUserId || "WM001", createdAt: now.toISOString() };

//     try {
//       await addInvLocation(payload);
//       alert('Inventory added successfully!');
//       navigate('/warehouse-manager/inventory-locations');
//     } catch (err) {
//       console.error(err);
//       alert('Failed to add inventory');
//     }
//   };

//   const inputClass = (field) => `w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100 ${
//     errors[field] ? "border-red-500" : "border-gray-300"
//   }`;

//   return (
//     <div>
//       <Navbar />
//   <div className="m-6 flex justify-center">
//         <div className="border-2 border-gray-300 m-auto p-8 w-xl  shadow bg-[#FFF8E8]">
//           <h1 className="text-2xl font-bold mb-6">Add Inventory</h1>

//           {errors.general && <p className="text-red-600 font-semibold mb-4">{errors.general}</p>}

//           <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm">

//             {/* Inventory Name */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Inventory Name <span className="text-red-500">*</span>
//               </label>
//               <input type="text" name="inventoryName" value={formData.inventoryName} onChange={handleChange} className={inputClass('inventoryName')} />
//               {errors.inventoryName && <p className="text-red-500 text-sm mt-1">{errors.inventoryName}</p>}
//             </div>

//             {/* Inventory Address */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Address <span className="text-red-500">*</span>
//               </label>
//               <input type="text" name="inventoryAddress" value={formData.inventoryAddress} onChange={handleChange} className={inputClass('inventoryAddress')} />
//               {errors.inventoryAddress && <p className="text-red-500 text-sm mt-1">{errors.inventoryAddress}</p>}
//             </div>

//             {/* Country */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Country <span className="text-red-500">*</span>
//               </label>
//               <select name="country" value={formData.country} onChange={handleChange} className={inputClass('country')}>
//                 <option value="">-- Select Country --</option>
//                 {Object.keys(countryPhoneRules).map(c => <option key={c} value={c}>{c}</option>)}
//               </select>
//               {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
//             </div>

//             {/* Capacity */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Capacity (m³) <span className="text-red-500">*</span>
//               </label>
//               <input type="text" name="capacity" value={formData.capacity} onChange={handleChange} className={inputClass('capacity')} />
//               {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
//             </div>

//             {/* Inventory Contact */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Contact <span className="text-red-500">*</span>
//               </label>
//               <input type="text" name="inventoryContact" value={formData.inventoryContact} onChange={handleChange} className={inputClass('inventoryContact')} />
//               {errors.inventoryContact && <p className="text-red-500 text-sm mt-1">{errors.inventoryContact}</p>}
//             </div>

//             {/* Warehouse Manager Name */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Warehouse Manager <span className="text-red-500">*</span>
//               </label>
//               <input type="text" name="warehouseManagerName" value={formData.warehouseManagerName} onChange={handleChange} className={inputClass('warehouseManagerName')} />
//               {errors.warehouseManagerName && <p className="text-red-500 text-sm mt-1">{errors.warehouseManagerName}</p>}
//             </div>

//             {/* Buttons */}
//             <div className="flex gap-4 pt-6">
//               <button type="submit" className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md">Add Inventory</button>
//               <button type="button" onClick={() => navigate('/warehouse-manager/inventory-locations')} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md">Cancel</button>
//             </div>

//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddInvLocationForm;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/navbar.jsx';
import { addInvLocation, fetchInvLocation } from "../services/FinvLocationService.js";

const countryPhoneRules = {
  "Sri Lanka": { code: "+94", digits: 9 },
  "USA": { code: "+1", digits: 10 },
  "India": { code: "+91", digits: 10 },
  "UK": { code: "+44", digits: 10 },
  "Germany": { code: "+49", digits: 10 },
  "Canada": { code: "+1", digits: 10 }
};

const AddInvLocationForm = ({ loggedInUserId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    inventoryName: '',
    inventoryAddress: '',
    country: '',
    capacity: '',
    inventoryContact: '',
    warehouseManagerName: ''
  });
  const [errors, setErrors] = useState({});
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchInvLocation();
        setLocations(data);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };
    loadLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only allow numbers for capacity and contact (excluding country code)
    if (name === 'capacity') {
      if (!/^\d*$/.test(value)) return;
    }
    if (name === 'inventoryContact') {
      if (!/^\d*$/.test(value.replace(/^\+?\d*/, ''))) return;
    }

    let updatedData = { ...formData, [name]: value };

    // Auto-fill country code for contact when country changes
    if (name === 'country') {
      const rule = countryPhoneRules[value];
      if (rule) {
        // Remove old country code if present
        const contactNumber = formData.inventoryContact.replace(/^\+\d+/, '');
        updatedData.inventoryContact = rule.code + contactNumber;
      }
    }

    setFormData(updatedData);
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};
    const { inventoryName, inventoryAddress, country, capacity, inventoryContact, warehouseManagerName } = formData;

    // Required
    if (!inventoryName.trim()) errs.inventoryName = "Inventory name is required";
    if (!inventoryAddress.trim()) errs.inventoryAddress = "Inventory address is required";
    if (!country.trim()) errs.country = "Country is required";
    if (!capacity) errs.capacity = "Capacity is required";
    if (!inventoryContact.trim()) errs.inventoryContact = "Contact is required";
    if (!warehouseManagerName.trim()) errs.warehouseManagerName = "Warehouse manager is required";

    // Capacity numeric
    if (capacity && isNaN(Number(capacity))) errs.capacity = "Capacity must be a number";

    // Contact validation
    if (country && inventoryContact) {
      const rule = countryPhoneRules[country];
      if (rule) {
        const contactNumber = inventoryContact.replace(/\D/g, ''); // keep only numbers
        const expectedLength = rule.code.replace("+", "").length + rule.digits; // code length + local digits

        if (contactNumber.length !== expectedLength) {
          errs.inventoryContact = `Contact number must be ${expectedLength} digits including country code for ${country}`;
        }

        // Ensure it starts with correct code
        if (!contactNumber.startsWith(rule.code.replace("+", ""))) {
          errs.inventoryContact = `Contact must start with ${rule.code}`;
        }
      }
    }

    // Check duplicates locally
    locations.forEach(loc => {
      if (loc.inventoryName === inventoryName) errs.inventoryName = "Inventory name already exists";
      if (loc.inventoryAddress === inventoryAddress) errs.inventoryAddress = "Inventory address already exists";
      if (loc.inventoryContact === inventoryContact) errs.inventoryContact = "Contact already exists";
    });

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    const now = new Date();
    const payload = { ...formData, createdBy: loggedInUserId || "WM001", createdAt: now.toISOString() };

    try {
      await addInvLocation(payload);
      alert('Inventory added successfully!');
      navigate('/warehouse-manager/inventory-locations');
    } catch (err) {
      console.error(err);
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to add inventory" });
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Inventory Location</h1>
          <p className="text-gray-600">Create a new inventory location to manage your warehouse operations</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Setup</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">New Inventory</div>
                  <div className="text-sm text-blue-700">
                    Create a new inventory location for storing and managing materials.
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Fill in all required details to set up the new inventory location.</p>
                  <p>All fields marked with <span className="text-red-500">*</span> are required.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inventory Name */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Inventory Name</label>
                    <input
                      type="text"
                      name="inventoryName"
                      value={formData.inventoryName}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={inputClass('inventoryName')}
                      placeholder="Enter inventory location name"
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

                  {/* Inventory Address */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Address</label>
                    <input
                      type="text"
                      name="inventoryAddress"
                      value={formData.inventoryAddress}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={inputClass('inventoryAddress')}
                      placeholder="Enter complete address"
                    />
                    {errors.inventoryAddress && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.inventoryAddress}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className={labelClass}>Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={inputClass('country')}
                    >
                      <option value="">Select country</option>
                      {Object.keys(countryPhoneRules).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.country}
                      </p>
                    )}
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className={labelClass}>Capacity (m³)</label>
                    <input
                      type="text"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={inputClass('capacity')}
                      placeholder="Enter capacity"
                    />
                    <p className="text-xs text-gray-500 mt-1">Storage capacity in cubic meters</p>
                    {errors.capacity && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.capacity}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inventory Contact */}
                  <div>
                    <label className={labelClass}>Contact Number</label>
                    <input
                      type="text"
                      name="inventoryContact"
                      value={formData.inventoryContact}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={inputClass('inventoryContact')}
                      placeholder="Country code + number"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-filled based on country selection</p>
                    {errors.inventoryContact && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.inventoryContact}
                      </p>
                    )}
                  </div>

                  {/* Warehouse Manager Name */}
                  <div>
                    <label className={labelClass}>Warehouse Manager</label>
                    <input
                      type="text"
                      name="warehouseManagerName"
                      value={formData.warehouseManagerName}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={inputClass('warehouseManagerName')}
                      placeholder="Enter manager's name"
                    />
                    {errors.warehouseManagerName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.warehouseManagerName}
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
                      Adding Inventory...
                    </>
                  ) : (
                    'Add Inventory Location'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/warehouse-manager/inventory-locations')}
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

export default AddInvLocationForm;