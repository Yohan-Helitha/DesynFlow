
import React, { useState } from "react";
import axios from "axios";
import "./Add_suppliers.css";
import { Link, useNavigate } from "react-router-dom";

function Add_suppliers() {
  const navigate = useNavigate();
  
  // Common material types based on construction industry
  const materialTypes = [
    "Cement", "Steel", "Wood", "Glass", "Paint", "Tiles", "Bricks", "Sand", 
    "Gravel", "Concrete", "Plumbing", "Electrical", "Roofing", "Insulation",
    "Hardware", "Tools", "Doors", "Windows", "Flooring", "Ceiling", "Walls"
  ];
  
  const materialCategories = [
    "Construction Materials",
    "Finishing Materials", 
    "Structural Materials",
    "Electrical Materials",
    "Plumbing Materials",
    "Hardware & Tools"
  ];
  
  const unitOptions = [
    "kg", "ton", "m²", "m³", "liter", "piece", "bag", "roll", "sheet", "meter", "feet"
  ];
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    materialTypes: "",
    deliveryRegions: "",
    materials: []
  });
  const [currentMaterial, setCurrentMaterial] = useState({
    name: "",
    category: "",
    type: "",
    unit: "",
    warrantyPeriod: "",
    pricePerUnit: ""
  });
  const [materialError, setMaterialError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
    // Clear previous error
    setMaterialError("");
    
    // Validate required fields
    if (!currentMaterial.name.trim()) {
      setMaterialError("Material name is required");
      return;
    }
    
    if (!currentMaterial.category) {
      setMaterialError("Category is required");
      return;
    }
    
    if (!currentMaterial.type) {
      setMaterialError("Type is required");
      return;
    }
    
    if (!currentMaterial.unit) {
      setMaterialError("Unit is required");
      return;
    }
    
    if (!currentMaterial.pricePerUnit || isNaN(parseFloat(currentMaterial.pricePerUnit)) || parseFloat(currentMaterial.pricePerUnit) < 0) {
      setMaterialError("Valid price per unit is required");
      return;
    }
    
    const newMaterial = {
      name: currentMaterial.name.trim(),
      category: currentMaterial.category,
      type: currentMaterial.type,
      unit: currentMaterial.unit,
      warrantyPeriod: currentMaterial.warrantyPeriod ? parseInt(currentMaterial.warrantyPeriod) : null,
      pricePerUnit: parseFloat(currentMaterial.pricePerUnit)
    };
    
    // Check if material already exists
    const existingIndex = formData.materials.findIndex(m => m.name.toLowerCase() === newMaterial.name.toLowerCase());
    if (existingIndex >= 0) {
      // Update existing material
      const updatedMaterials = [...formData.materials];
      updatedMaterials[existingIndex] = newMaterial;
      setFormData({ ...formData, materials: updatedMaterials });
      setMaterialError("Material updated successfully!");
      setTimeout(() => setMaterialError(""), 2000);
    } else {
      // Add new material
      setFormData({ 
        ...formData, 
        materials: [...formData.materials, newMaterial]
      });
      setMaterialError("Material added successfully!");
      setTimeout(() => setMaterialError(""), 2000);
    }
    
    // Reset form
    setCurrentMaterial({ name: "", category: "", type: "", unit: "", warrantyPeriod: "", pricePerUnit: "" });
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

    // Validate password
    if (!formData.password || formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
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
      // Keep the full materials array with all details for backend processing
    };

    // Remove confirmPassword from the data sent to backend
    delete formattedData.confirmPassword;

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

        {/* Password Section */}
        <div className="password-section">
          <h3 className="password-section-title">Account Security</h3>
          <div className="password-fields-container">
            <div className="password-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min. 6 characters)"
                required
                className={passwordError ? 'password-input-error' : 'password-input-normal'}
              />
            </div>
            <div className="password-field">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                className={passwordError ? 'password-input-error' : 'password-input-normal'}
              />
            </div>
          </div>
          {passwordError && (
            <div className="password-error-message">
              {passwordError}
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "10px" }}>
              <div>
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
              <div>
                <label style={{ fontSize: "14px", marginBottom: "5px", display: "block" }}>Category</label>
                <select
                  name="category"
                  value={currentMaterial.category}
                  onChange={handleMaterialChange}
                  style={{ 
                    width: "100%", 
                    padding: "8px", 
                    border: "1px solid #ccc", 
                    borderRadius: "4px" 
                  }}
                >
                  <option value="">Select Category</option>
                  {materialCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "14px", marginBottom: "5px", display: "block" }}>Type</label>
                <select
                  name="type"
                  value={currentMaterial.type}
                  onChange={handleMaterialChange}
                  style={{ 
                    width: "100%", 
                    padding: "8px", 
                    border: "1px solid #ccc", 
                    borderRadius: "4px" 
                  }}
                >
                  <option value="">Select Type</option>
                  {materialTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "14px", marginBottom: "5px", display: "block" }}>Unit</label>
                <select
                  name="unit"
                  value={currentMaterial.unit}
                  onChange={handleMaterialChange}
                  style={{ 
                    width: "100%", 
                    padding: "8px", 
                    border: "1px solid #ccc", 
                    borderRadius: "4px" 
                  }}
                >
                  <option value="">Select Unit</option>
                  {unitOptions.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "14px", marginBottom: "5px", display: "block" }}>Warranty Period (months)</label>
                <input
                  type="number"
                  name="warrantyPeriod"
                  value={currentMaterial.warrantyPeriod}
                  onChange={handleMaterialChange}
                  placeholder="Optional"
                  min="0"
                  style={{ 
                    width: "100%", 
                    padding: "8px", 
                    border: "1px solid #ccc", 
                    borderRadius: "4px" 
                  }}
                />
              </div>
              <div>
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
                cursor: "pointer"
              }}
            >
              Add Material
            </button>
            {materialError && (
              <div style={{ 
                marginTop: "10px", 
                padding: "8px 12px", 
                borderRadius: "4px",
                backgroundColor: materialError.includes("successfully") ? "#d4edda" : "#f8d7da",
                color: materialError.includes("successfully") ? "#155724" : "#721c24",
                border: `1px solid ${materialError.includes("successfully") ? "#c3e6cb" : "#f5c6cb"}`,
                fontSize: "14px"
              }}>
                {materialError}
              </div>
            )}
          </div>

          {/* Materials List */}
          {formData.materials.length > 0 && (
            <div className="materials-list">
              <h4 style={{ color: "#674636", marginBottom: "10px" }}>Added Materials:</h4>
              <div style={{ 
                maxHeight: "300px", 
                overflowY: "auto", 
                border: "1px solid #ddd", 
                borderRadius: "5px" 
              }}>
                {formData.materials.map((material, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: "15px", 
                      borderBottom: "1px solid #eee",
                      backgroundColor: index % 2 === 0 ? "#f8f8f8" : "white"
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "10px" }}>
                      <div><strong>Name:</strong> {material.name}</div>
                      <div><strong>Category:</strong> {material.category}</div>
                      <div><strong>Type:</strong> {material.type}</div>
                      <div><strong>Unit:</strong> {material.unit}</div>
                      <div><strong>Warranty:</strong> {material.warrantyPeriod ? `${material.warrantyPeriod} months` : 'N/A'}</div>
                      <div><strong>Price:</strong> LKR {material.pricePerUnit.toFixed(2)}/{material.unit}</div>
                    </div>
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

