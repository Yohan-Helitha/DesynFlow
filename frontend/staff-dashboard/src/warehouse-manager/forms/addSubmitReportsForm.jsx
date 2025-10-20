// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../component/navbar.jsx";
// import { submitReport } from "../services/FsubmitReportsService.js"; // create this service

// const SubmitReportForm = ({ loggedInUserId }) => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     reportTitle: "",
//     reportFile: null,
//   });

//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === "reportFile") {
//       setFormData((prev) => ({ ...prev, reportFile: files[0] }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.reportTitle || !formData.reportFile) {
//       alert("Please fill all fields and select a file.");
//       return;
//     }

//     // Confirmation dialog
//     if (!window.confirm("Do you want to submit this report? Once it is submitted it cannot be undone.")) {
//       return;
//     }

//     try {
//       const payload = new FormData();
//       payload.append("reportTitle", formData.reportTitle);
//       payload.append("reportFile", formData.reportFile);

//       await submitReport(payload);
//       alert("Report submitted successfully!");
//       navigate("/warehouse-manager/submit-reports");
//     } catch (err) {
//       console.error(err);
//       alert(err?.errors ? Object.values(err.errors).join(", ") : "Failed to submit report");
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
//           <h1 className="text-2xl font-bold mb-6">Submit Report</h1>

//           {errors.general && <p className="text-red-600 font-semibold mb-4">{errors.general}</p>}

//           <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm">
//             {/* Report Title */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Report Title <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="reportTitle"
//                 value={formData.reportTitle}
//                 onChange={handleChange}
//                 required
//                 className={inputClass("reportTitle")}
//                 placeholder="Enter report title"
//               />
//             </div>

//             {/* Report File */}
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Upload Report <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="file"
//                 name="reportFile"
//                 accept=".pdf,.doc,.docx,.xlsx"
//                 onChange={handleChange}
//                 required
//                 className={inputClass("reportFile")}
//               />
//             </div>

//             {/* Buttons */}
//             <div className="flex gap-4 pt-6">
//               <button
//                 type="submit"
//                 className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
//               >
//                 Submit Report
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate("/warehouse-manager/submit-reports")}
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

// export default SubmitReportForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import { submitReport } from "../services/FsubmitReportsService.js";

const SubmitReportForm = ({ loggedInUserId }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    reportTitle: "",
    reportFile: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "reportFile") {
      setFormData((prev) => ({ ...prev, reportFile: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

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
    if (!formData.reportTitle?.trim()) newErrors.reportTitle = "Report title is required";
    if (!formData.reportFile) newErrors.reportFile = "Report file is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Confirmation dialog
    if (!window.confirm("Do you want to submit this report? Once it is submitted it cannot be undone.")) {
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("reportTitle", formData.reportTitle);
      payload.append("reportFile", formData.reportFile);

      await submitReport(payload);
      alert("Report submitted successfully!");
      navigate("/warehouse-manager/submit-reports");
    } catch (err) {
      console.error(err);
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || "Failed to submit report" });
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Report</h1>
          <p className="text-gray-600">Upload and submit reports for management review</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Submission</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">New Report</div>
                  <div className="text-sm text-blue-700">
                    Submit reports for management review and archival.
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Upload reports in PDF, Word, or Excel format.</p>
                  <p>Fields marked with <span className="text-red-500">*</span> are required.</p>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Accepted formats: PDF, DOC, DOCX, XLSX</p>
                  <p className="mt-1">Maximum file size: 10MB</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-yellow-800 text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Important
                  </div>
                  <p className="text-yellow-700 text-xs mt-1">
                    Once submitted, reports cannot be modified or withdrawn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Details</h2>
                
                <div className="space-y-6">
                  {/* Report Title */}
                  <div>
                    <label className={labelClass}>
                      Report Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="reportTitle"
                      value={formData.reportTitle}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className={inputClass("reportTitle")}
                      placeholder="Enter a descriptive report title"
                    />
                    {errors.reportTitle && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.reportTitle}
                      </p>
                    )}
                  </div>

                  {/* Report File */}
                  <div>
                    <label className={labelClass}>
                      Upload Report <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        name="reportFile"
                        accept=".pdf,.doc,.docx,.xlsx"
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        className={inputClass("reportFile")}
                      />
                      {formData.reportFile && (
                        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-green-800 text-sm font-medium">
                            File selected: {formData.reportFile.name}
                          </span>
                        </div>
                      )}
                    </div>
                    {errors.reportFile && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.reportFile}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      Supported formats: PDF, DOC, DOCX, XLSX • Max size: 10MB
                    </p>
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
                      Submitting Report...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/warehouse-manager/submit-reports")}
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

export default SubmitReportForm;