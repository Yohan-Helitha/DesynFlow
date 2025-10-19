// // src/pages/updateWarrantyClaimForm.jsx

// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import Navbar from "../component/navbar.jsx";
// import { fetchWarrantyClaimById, updateWarrantyClaim } from "../services/FwarrantyClaimService.js";

// const UpdateWarrantyClaimForm = ({ loggedInUserId }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     warrantyId: "",
//     clientId: "",
//     issueDescription: "",
//     status: "",
//     financeReviewerId: "",
//     shippedReplacement: "", // warehouse action field
//     shippedAt: ""
//   });

//   const [errors, setErrors] = useState({});

//   // 🔹 Fetch warranty claim by ID
//   useEffect(() => {
//     const getClaim = async () => {
//       try {
//         const data = await fetchWarrantyClaimById(id);

//         // Convert shippedAt to YYYY-MM-DD format for input type="date"
//         if (data.warehouseAction?.shippedAt) {
//           const date = new Date(data.warehouseAction.shippedAt);
//           data.warehouseAction.shippedAt = date.toISOString().split("T")[0];
//         }

//         setFormData({
//           warrantyId: data.warrantyId || "",
//           clientId: data.clientId || "",
//           issueDescription: data.issueDescription || "",
//           status: data.status || "",
//           financeReviewerId: data.financeReviewerId || "",
//           shippedReplacement: data.warehouseAction?.shippedReplacement ? "Shipped" : "Checked",
//           shippedAt: data.warehouseAction?.shippedAt || ""
//         });
//       } catch (err) {
//         console.error("Failed to fetch warranty claim:", err);
//       }
//     };
//     getClaim();
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

//     if (!formData.shippedReplacement) {
//       setErrors({ shippedReplacement: "Please select an action" });
//       return;
//     }

//     const payload = {
//       warehouseAction: {
//         shippedReplacement: formData.shippedReplacement === "Shipped",
//         shippedAt: formData.shippedReplacement === "Shipped" ? new Date() : null,
//       },
//       updatedBy: loggedInUserId || "WM001",
//     };

//     try {
//       await updateWarrantyClaim(id, payload);
//       alert("Warranty claim updated successfully!");
//       navigate("/warehouse-manager/warranty-claims");
//     } catch (err) {
//       setErrors({ general: err.message || "Failed to update warranty claim" });
//     }
//   };

//   const inputClass = (field) =>
//     `w-full px-3 py-2 border rounded-md bg-gray-100 disabled:bg-gray-100 ${
//       errors[field] ? "border-red-500" : "border-gray-300"
//     }`;

//   return (
//     <div>
//       <Navbar />
//   <div className="m-6 flex justify-center">
//   <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
//           <h1 className="text-2xl font-bold mb-6">Update Warranty Claim</h1>

//           {errors.general && (
//             <p className="text-red-600 font-semibold mb-4">{errors.general}</p>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4 text-sm max-w-3xl">
//             {/* Warranty ID */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Warranty ID</label>
//               <input
//                 type="text"
//                 name="warrantyId"
//                 value={formData.warrantyId}
//                 disabled
//                 className={inputClass("warrantyId")}
//               />
//             </div>

//             {/* Client ID */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Client ID</label>
//               <input
//                 type="text"
//                 name="clientId"
//                 value={formData.clientId}
//                 disabled
//                 className={inputClass("clientId")}
//               />
//             </div>

//             {/* Issue Description */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Issue Description</label>
//               <input
//                 type="text"
//                 name="issueDescription"
//                 value={formData.issueDescription}
//                 disabled
//                 className={inputClass("issueDescription")}
//               />
//             </div>

//             {/* Status */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Status</label>
//               <input
//                 type="text"
//                 name="status"
//                 value={formData.status}
//                 disabled
//                 className={inputClass("status")}
//               />
//             </div>

//             {/* Finance Reviewer */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Finance Reviewer</label>
//               <input
//                 type="text"
//                 name="financeReviewerId"
//                 value={formData.financeReviewerId}
//                 disabled
//                 className={inputClass("financeReviewerId")}
//               />
//             </div>

//             {/* Shipped Replacement */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Warehouse Action <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="shippedReplacement"
//                 value={formData.shippedReplacement}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
//               >
//                 <option value="">-- Select Action --</option>
//                 <option value="Shipped">Shipped</option>
//                 <option value="Checked">Checked</option>
//               </select>
//               {errors.shippedReplacement && (
//                 <p className="text-red-500 text-sm mt-1">{errors.shippedReplacement}</p>
//               )}
//             </div>

//             {/* Buttons */}
//             <div className="flex gap-4 pt-6">
//               <button
//                 type="submit"
//                 className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
//               >
//                 Update Claim
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate("/warehouse-manager/warranty-claims")}
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

// export default UpdateWarrantyClaimForm;

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import { fetchWarrantyClaimById, updateWarrantyClaim } from "../services/FwarrantyClaimService.js";

const UpdateWarrantyClaimForm = ({ loggedInUserId }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    warrantyId: "",
    clientId: "",
    issueDescription: "",
    status: "",
    financeReviewerId: "",
    shippedReplacement: "", // warehouse action field
    shippedAt: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Fetch warranty claim by ID
  useEffect(() => {
    const getClaim = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWarrantyClaimById(id);

        if (data) {
          // Convert shippedAt to YYYY-MM-DD format for input type="date"
          if (data.warehouseAction?.shippedAt) {
            const date = new Date(data.warehouseAction.shippedAt);
            data.warehouseAction.shippedAt = date.toISOString().split("T")[0];
          }

          setFormData({
            warrantyId: data.warrantyId || "",
            clientId: data.clientId || "",
            issueDescription: data.issueDescription || "",
            status: data.status || "",
            financeReviewerId: data.financeReviewerId || "",
            shippedReplacement: data.warehouseAction?.shippedReplacement ? "Shipped" : "Checked",
            shippedAt: data.warehouseAction?.shippedAt || ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch warranty claim:", err);
        setErrors({ general: "Failed to load warranty claim data" });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      getClaim();
    }
  }, [id]);

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

    if (!formData.shippedReplacement) {
      setErrors({ shippedReplacement: "Please select an action" });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      warehouseAction: {
        shippedReplacement: formData.shippedReplacement === "Shipped",
        shippedAt: formData.shippedReplacement === "Shipped" ? new Date() : null,
      },
      updatedBy: loggedInUserId || "WM001",
    };

    try {
      await updateWarrantyClaim(id, payload);
      alert("Warranty claim updated successfully!");
      navigate("/warehouse-manager/warranty-claims");
    } catch (err) {
      setErrors({ general: err.message || "Failed to update warranty claim" });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Update Warranty Claim</h1>
          <p className="text-gray-600">Update warehouse actions for warranty claim processing</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Details</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">Update Warranty Claim</div>
                  <div className="text-sm text-blue-700">
                    Update warehouse actions for warranty claim processing and tracking.
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Review claim details and update warehouse actions.</p>
                  <p>Fields marked with <span className="text-red-500">*</span> are required.</p>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Basic claim information cannot be modified.</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-yellow-800 text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Warehouse Actions
                  </div>
                  <p className="text-yellow-700 text-xs mt-1">
                    Selecting "Shipped" will automatically set the shipment date.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Claim Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Warranty ID */}
                  <div>
                    <label className={labelClass}>Warranty ID</label>
                    <input
                      type="text"
                      name="warrantyId"
                      value={formData.warrantyId}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Client ID */}
                  <div>
                    <label className={labelClass}>Client ID</label>
                    <input
                      type="text"
                      name="clientId"
                      value={formData.clientId}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className={labelClass}>Status</label>
                    <input
                      type="text"
                      name="status"
                      value={formData.status}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Finance Reviewer */}
                  <div>
                    <label className={labelClass}>Finance Reviewer</label>
                    <input
                      type="text"
                      name="financeReviewerId"
                      value={formData.financeReviewerId}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Issue Description */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Issue Description</label>
                    <textarea
                      name="issueDescription"
                      value={formData.issueDescription}
                      disabled
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Warehouse Actions</h2>
                
                <div className="space-y-6">
                  {/* Shipped Replacement */}
                  <div>
                    <label className={labelClass}>
                      Warehouse Action <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="shippedReplacement"
                      value={formData.shippedReplacement}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className={inputClass("shippedReplacement")}
                    >
                      <option value="">-- Select Action --</option>
                      <option value="Checked">Checked - Item inspected and verified</option>
                      <option value="Shipped">Shipped - Replacement item dispatched</option>
                    </select>
                    {errors.shippedReplacement && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.shippedReplacement}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      Select "Shipped" to mark replacement as dispatched with current date.
                    </p>
                  </div>

                  {/* Action Description */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Action Description</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span><strong>Checked:</strong> Item has been inspected and verified in warehouse</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span><strong>Shipped:</strong> Replacement item has been dispatched to client</span>
                      </div>
                    </div>
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
                      Updating Claim...
                    </>
                  ) : (
                    'Update Warranty Claim'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/warehouse-manager/warranty-claims")}
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

export default UpdateWarrantyClaimForm;