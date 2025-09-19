import React, { useState } from "react";
import "./Add_suppliers.css";

function Add_suppliers() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    materialTypes: "", // comma-separated string in the form
    deliveryRegions: "", // comma-separated string in the form
    rating: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Note: per request, no backend submission logic is included. This is form UI only.
  const handleSubmit = (e) => {
    e.preventDefault();
    // local-only preview
    console.log("Form data (local only):", formData);
    // reset form
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      materialTypes: "",
      deliveryRegions: "",
      rating: ""
    });
  };

  return (
    <div className="add-supplier-container">
      <h2>Add New Supplier</h2>

      <form className="add-supplier-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
            required
          />
        </div>

        <div className="form-group">
          <label>Contact Name</label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Enter contact person's name"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contact@company.com"
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +1-555-555-5555"
          />
        </div>

        <div className="form-group">
          <label>Material Types (comma-separated)</label>
          <input
            type="text"
            name="materialTypes"
            value={formData.materialTypes}
            onChange={handleChange}
            placeholder="e.g. Wood,Metal,Glass"
          />
        </div>

        <div className="form-group">
          <label>Delivery Regions (comma-separated)</label>
          <input
            type="text"
            name="deliveryRegions"
            value={formData.deliveryRegions}
            onChange={handleChange}
            placeholder="e.g. North,South,East"
          />
        </div>

        <div className="form-group">
          <label>Rating (optional)</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
            placeholder="0 - 5"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">Add Supplier (local)</button>
        </div>
      </form>
    </div>
  );
}

export default Add_suppliers;
