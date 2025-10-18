// src/pages/updateWarrantyClaimForm.jsx

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

  // 🔹 Fetch warranty claim by ID
  useEffect(() => {
    const getClaim = async () => {
      try {
        const data = await fetchWarrantyClaimById(id);

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
      } catch (err) {
        console.error("Failed to fetch warranty claim:", err);
      }
    };
    getClaim();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.shippedReplacement) {
      setErrors({ shippedReplacement: "Please select an action" });
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
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-md bg-gray-100 disabled:bg-gray-100 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div>
      <Navbar />
  <div className="m-6 flex justify-center">
  <div className="border-2 border-brown-primary-300 w-full max-w-4xl p-8 shadow bg-cream-primary rounded">
          <h1 className="text-2xl font-bold mb-6">Update Warranty Claim</h1>

          {errors.general && (
            <p className="text-red-600 font-semibold mb-4">{errors.general}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm max-w-3xl">
            {/* Warranty ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Warranty ID</label>
              <input
                type="text"
                name="warrantyId"
                value={formData.warrantyId}
                disabled
                className={inputClass("warrantyId")}
              />
            </div>

            {/* Client ID */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Client ID</label>
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                disabled
                className={inputClass("clientId")}
              />
            </div>

            {/* Issue Description */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Issue Description</label>
              <input
                type="text"
                name="issueDescription"
                value={formData.issueDescription}
                disabled
                className={inputClass("issueDescription")}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Status</label>
              <input
                type="text"
                name="status"
                value={formData.status}
                disabled
                className={inputClass("status")}
              />
            </div>

            {/* Finance Reviewer */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Finance Reviewer</label>
              <input
                type="text"
                name="financeReviewerId"
                value={formData.financeReviewerId}
                disabled
                className={inputClass("financeReviewerId")}
              />
            </div>

            {/* Shipped Replacement */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Warehouse Action <span className="text-red-500">*</span>
              </label>
              <select
                name="shippedReplacement"
                value={formData.shippedReplacement}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">-- Select Action --</option>
                <option value="Shipped">Shipped</option>
                <option value="Checked">Checked</option>
              </select>
              {errors.shippedReplacement && (
                <p className="text-red-500 text-sm mt-1">{errors.shippedReplacement}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2 px-6 rounded-md"
              >
                Update Claim
              </button>
              <button
                type="button"
                onClick={() => navigate("/warehouse-manager/warranty-claims")}
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

export default UpdateWarrantyClaimForm;
