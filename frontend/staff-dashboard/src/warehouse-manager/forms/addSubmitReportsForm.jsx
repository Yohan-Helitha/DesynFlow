import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/navbar.jsx";
import { submitReport } from "../services/FsubmitReportsService.js"; // create this service

const SubmitReportForm = ({ loggedInUserId }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    reportTitle: "",
    reportFile: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "reportFile") {
      setFormData((prev) => ({ ...prev, reportFile: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reportTitle || !formData.reportFile) {
      alert("Please fill all fields and select a file.");
      return;
    }

    // Confirmation dialog
    if (!window.confirm("Do you want to submit this report? Once it is submitted it cannot be undone.")) {
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
      alert(err?.errors ? Object.values(err.errors).join(", ") : "Failed to submit report");
    }
  };


  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md bg-white ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div>
      <Navbar />
      <div className="m-6">
  <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
          <h1 className="text-2xl font-bold mb-6">Submit Report</h1>

          {errors.general && <p className="text-red-600 font-semibold mb-4">{errors.general}</p>}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl text-sm">
            {/* Report Title */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Report Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reportTitle"
                value={formData.reportTitle}
                onChange={handleChange}
                required
                className={inputClass("reportTitle")}
                placeholder="Enter report title"
              />
            </div>

            {/* Report File */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Upload Report <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="reportFile"
                accept=".pdf,.doc,.docx,.xlsx"
                onChange={handleChange}
                required
                className={inputClass("reportFile")}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
              >
                Submit Report
              </button>
              <button
                type="button"
                onClick={() => navigate("/warehouse-manager/submit-reports")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-md"
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

export default SubmitReportForm;
