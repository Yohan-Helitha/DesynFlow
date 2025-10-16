
import React, { useState } from "react";
import axios from "axios";
import "./Add_suppliers.css";
import { Link, useNavigate } from "react-router-dom";

function Add_suppliers() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    materialTypes: "",
    deliveryRegions: "",
    materials: []
  });
  const [currentMaterial, setCurrentMaterial] = useState({
    name: "",
    pricePerUnit: ""
  });
  const [phoneError, setPhoneError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    
    // Remove all non-digit characters
    const numbersOnly = value.replace(/\D/g, '');
    
    // Validate phone number
    if (numbersOnly === '') {
      setPhoneError('');
      setFormData({ ...formData, phone: '' });
      return;
    }
    
    if (numbersOnly.length > 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    
    if (numbersOnly.length > 0 && numbersOnly[0] !== '0') {
      setPhoneError('Phone number must start with 0');
      setFormData({ ...formData, phone: numbersOnly });
      return;
    }
    
    if (numbersOnly.length === 10) {
      setPhoneError('');
    } else if (numbersOnly.length < 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    }
    
    setFormData({ ...formData, phone: numbersOnly });
  };

  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    setCurrentMaterial({ ...currentMaterial, [name]: value });
  };

  const addMaterial = () => {
    if (currentMaterial.name && currentMaterial.pricePerUnit) {
      const newMaterial = {
        name: currentMaterial.name.trim(),
        pricePerUnit: parseFloat(currentMaterial.pricePerUnit)
      };
      
      // Check if material already exists
      const existingIndex = formData.materials.findIndex(m => m.name.toLowerCase() === newMaterial.name.toLowerCase());
      if (existingIndex >= 0) {
        // Update existing material
        const updatedMaterials = [...formData.materials];
        updatedMaterials[existingIndex] = newMaterial;
        setFormData({ ...formData, materials: updatedMaterials });
      } else {
        // Add new material
        setFormData({ 
          ...formData, 
          materials: [...formData.materials, newMaterial]
        });
      }
      
      setCurrentMaterial({ name: "", pricePerUnit: "" });
    }
  };

  const removeMaterial = (index) => {
    const updatedMaterials = formData.materials.filter((_, i) => i !== index);
    setFormData({ ...formData, materials: updatedMaterials });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number
    if (!formData.phone || formData.phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    
    if (formData.phone[0] !== '0') {
      setPhoneError('Phone number must start with 0');
      return;
    }

    if (formData.materials.length === 0) {
        console.log("Please add at least one material with its price.");
      return;
    }

    // Convert comma-separated fields into arrays for schema
    const formattedData = {
      ...formData,
      materialTypes: formData.materials.map(m => m.name), // Use material names from the materials array
      deliveryRegions: formData.deliveryRegions
        .split(",")
        .map((region) => region.trim()),
    };

    try {
      const response = await axios.post("/api/suppliers", formattedData);
      console.log(`Supplier "${formData.companyName}" has been added successfully!`);
      
      // Navigate to supplier details page after successful addition
      navigate('/procurement-officer/supplier_details', {
        state: {
          newSupplierAdded: true,
          supplierName: formData.companyName,
          supplierId: response.data._id || response.data.id
        }
      });
    } catch (err) {
      console.error("Error adding supplier:", err);
        console.error("Failed to add supplier. Please try again.");
    }
  };

  return (
    <div className="add-supplier-container">
        <div className="header-with-back">
          <button 
            type="button"
            className="back-to-suppliers-btn"
            onClick={() => navigate('/procurement-officer/supplier_details')}
          >
            ← Back to Suppliers
          </button>
          <h2>Add New Supplier</h2>
        </div>

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
            onChange={handlePhoneChange}
            placeholder="Enter phone number (e.g., 0771234567)"
            maxLength="10"
            required
            className={phoneError ? 'phone-input-error' : 'phone-input-normal'}
          />
          {phoneError && (
            <div className="phone-error-message">
              {phoneError}
            </div>
          )}
        </div>

        {/* Materials with Pricing */}
        <div className="form-group">
          <label>Materials & Pricing</label>
          
          {/* Add Material Section */}
          <div className="add-material-section" style={{ 
            border: "1px solid #ddd", 
            padding: "15px", 
            borderRadius: "5px", 
            marginBottom: "15px",
            backgroundColor: "#f9f9f9"
          }}>
            <h4 style={{ marginTop: 0, color: "#674636" }}>Add Material</h4>
            <div style={{ display: "flex", gap: "10px", alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "14px", marginBottom: "5px", display: "block" }}>Material Name</label>
                <input
                  type="text"
                  name="name"
                  value={currentMaterial.name}
                  onChange={handleMaterialChange}
                  placeholder="e.g. Wood, Glass, Metal"
                  style={{ 
                    width: "100%", 
                    padding: "8px", 
                    border: "1px solid #ccc", 
                    borderRadius: "4px" 
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "14px", marginBottom: "5px", display: "block" }}>Price per Unit (LKR)</label>
                <input
                  type="number"
                  name="pricePerUnit"
                  value={currentMaterial.pricePerUnit}
                  onChange={handleMaterialChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  style={{ 
                    width: "100%", 
                    padding: "8px", 
                    border: "1px solid #ccc", 
                    borderRadius: "4px" 
                  }}
                />
              </div>
              <button 
                type="button" 
                onClick={addMaterial}
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: "#674636", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: "pointer",
                  height: "36px"
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Materials List */}
          {formData.materials.length > 0 && (
            <div className="materials-list">
              <h4 style={{ color: "#674636", marginBottom: "10px" }}>Added Materials:</h4>
              <div style={{ 
                maxHeight: "200px", 
                overflowY: "auto", 
                border: "1px solid #ddd", 
                borderRadius: "5px" 
              }}>
                {formData.materials.map((material, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "10px 15px", 
                      borderBottom: "1px solid #eee",
                      backgroundColor: index % 2 === 0 ? "#f8f8f8" : "white"
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>{material.name}</span>
                    <span style={{ color: "#674636" }}>LKR {material.pricePerUnit.toFixed(2)}/unit</span>
                    <button 
                      type="button" 
                      onClick={() => removeMaterial(index)}
                      style={{ 
                        padding: "4px 8px", 
                        backgroundColor: "#dc3545", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
             Add Supplier
          </button>
        </div>
      </form>
    </div>
  );
}

export default Add_suppliers;

