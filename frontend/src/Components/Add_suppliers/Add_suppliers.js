import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Add_suppliers.css";

function Add_suppliers() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    materialTypes: "",
    deliveryRegions: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert comma-separated fields into arrays for schema
    const formattedData = {
      ...formData,
      materialTypes: formData.materialTypes
        .split(",")
        .map((item) => item.trim()),
      deliveryRegions: formData.deliveryRegions
        .split(",")
        .map((region) => region.trim()),
    };

    console.log("Supplier Added:", formattedData);
    alert(`Supplier "${formData.companyName}" has been added successfully!`);

    // Reset form
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      materialTypes: "",
      deliveryRegions: ""
    });
  };

  return (
    <div className="add-supplier-container">
      <h2>Add New Supplier</h2>

      <form className="add-supplier-form" onSubmit={handleSubmit}>
        {/* Company Name */}
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

        {/* Contact Name */}
        <div className="form-group">
          <label>Contact Person</label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Enter contact person's name"
            required
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            required
          />
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            required
          />
        </div>

        {/* Material Types */}
        <div className="form-group">
          <label>Material Types</label>
          <input
            type="text"
            name="materialTypes"
            value={formData.materialTypes}
            onChange={handleChange}
            placeholder="e.g. Wood, Glass, Metal"
            required
          />
        </div>

        {/* Delivery Regions */}
        <div className="form-group">
          <label>Delivery Regions</label>
          <input
            type="text"
            name="deliveryRegions"
            value={formData.deliveryRegions}
            onChange={handleChange}
            placeholder="e.g. Colombo, Kandy, Galle"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            ➕ Add Supplier
          </button>
        </div>
      </form>
    </div>
  );
}

export default Add_suppliers;
