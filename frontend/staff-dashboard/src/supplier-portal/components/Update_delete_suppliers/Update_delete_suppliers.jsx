import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Update_delete_suppliers.css";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBox } from 'react-icons/fa';

const API_BASE = "http://localhost:4000/api/suppliers"; // your backend

function Update_delete_suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSupplier, setEditingSupplier] = useState(null); // holds supplier being edited
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

  // fetch suppliers on load
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(API_BASE);
      // Sort suppliers by creation date - newest first
      const sortedSuppliers = res.data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
        return dateB - dateA; // Newest first
      });
      setSuppliers(sortedSuppliers);
    } catch (err) {
      console.error("Error fetching suppliers", err);
    }
  };

  // open update form
  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier._id);
    setFormData({
      companyName: supplier.companyName,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      materialTypes: supplier.materialTypes?.join(", ") || "",
      deliveryRegions: supplier.deliveryRegions?.join(", ") || "",
      materials: supplier.materials || []
    });
  };

  // close update form
  const handleCancel = () => {
    setEditingSupplier(null);
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      materialTypes: "",
      deliveryRegions: "",
      materials: []
    });
    setCurrentMaterial({ name: "", pricePerUnit: "" });
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

  // update supplier
  const handleUpdate = async (e) => {
    e.preventDefault();

    const updated = {
      ...formData,
      materialTypes: formData.materials.length > 0 ? 
        formData.materials.map(m => m.name) : 
        formData.materialTypes.split(",").map((m) => m.trim()),
      deliveryRegions: formData.deliveryRegions.split(",").map((r) => r.trim())
    };

    try {
      await axios.put(`${API_BASE}/${editingSupplier}`, updated);
  console.log('Supplier updated successfully');
      handleCancel();
      fetchSuppliers();
    } catch (err) {
      console.error("Error updating supplier", err);
  console.error('Failed to update supplier');
    }
  };

  // delete supplier
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Delete supplier "${name}"?`);
    console.log('Delete confirmation result:', confirmed);
    if (!confirmed) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
        console.log('Supplier deleted successfully');
      fetchSuppliers();
    } catch (err) {
      console.error("Error deleting supplier", err);
        console.error('Failed to delete supplier');
    }
  };

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Filtered suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier => {
    const companyName = (supplier.companyName || "").toLowerCase();
    const contactName = (supplier.contactName || "").toLowerCase();
    const email = (supplier.email || "").toLowerCase();
    const materialTypes = (supplier.materialTypes || []).join(" ").toLowerCase();
    const term = (searchTerm || "").toLowerCase();
    return companyName.includes(term) || contactName.includes(term) || email.includes(term) || materialTypes.includes(term);
  });

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="suppliers-page">
        <div className="suppliers-container">
          {/* Modern Header - Same as Orders */}
          <div className="suppliers-header">
            <div className="header-content">
              <div className="title-section">
                <h1 className="page-title">
                  <FaBuilding className="title-icon" />
                  Supplier Management
                </h1>
                <p className="page-description">Manage your network of trusted suppliers and partnerships</p>
              </div>
              <div className="header-controls">
                <div className="search-box">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Link to="/procurement-officer/add_suppliers" className="create-supplier-btn">
                  <FaPlus className="btn-icon" />
                  Add Supplier
                </Link>
              </div>
            </div>
          </div>

          {/* Suppliers Table Section - Same structure as Orders */}
          <div className="table-section">
            <div className="table-wrapper">
              <div className="table-container">
                <table className="suppliers-table">
                  <thead>
                    <tr>
                      <th className="col-supplier-id">#</th>
                      <th className="col-company">Company</th>
                      <th className="col-contact">Contact Person</th>
                      <th className="col-email">Email</th>
                      <th className="col-phone">Phone</th>
                      <th className="col-materials">Materials</th>
                      <th className="col-regions">Service Regions</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((s, i) => (
                        <tr key={s._id} className="table-row">
                          <td className="col-supplier-id">
                            <div className="supplier-id-wrapper">
                              <span className="supplier-id">#{String(i + 1).padStart(3, '0')}</span>
                            </div>
                          </td>
                          <td className="col-company">
                            <div className="company-info">
                              <span className="company-name">{s.companyName}</span>
                            </div>
                          </td>
                          <td className="col-contact">
                            <div className="contact-wrapper">
                              <span className="contact-name">{s.contactName}</span>
                            </div>
                          </td>
                          <td className="col-email">
                            <div className="email-wrapper">
                              <a href={`mailto:${s.email}`} className="email-link">
                                <FaEnvelope className="contact-icon" />
                                {s.email}
                              </a>
                            </div>
                          </td>
                          <td className="col-phone">
                            <div className="phone-wrapper">
                              <a href={`tel:${s.phone}`} className="phone-link">
                                <FaPhone className="contact-icon" />
                                {s.phone}
                              </a>
                            </div>
                          </td>
                          <td className="col-materials">
                            <div className="materials-wrapper">
                              {s.materialTypes?.slice(0, 2).map((material, idx) => (
                                <span key={idx} className="material-tag">{material}</span>
                              ))}
                              {s.materialTypes?.length > 2 && (
                                <span className="material-more">+{s.materialTypes.length - 2} more</span>
                              )}
                            </div>
                          </td>
                          <td className="col-regions">
                            <div className="regions-wrapper">
                              <FaMapMarkerAlt className="region-icon" />
                              <span className="regions-text">
                                {s.deliveryRegions?.slice(0, 2).join(", ")}
                                {s.deliveryRegions?.length > 2 && "..."}
                              </span>
                            </div>
                          </td>
                          <td className="col-actions">
                            <div className="actions-wrapper">
                              <button className="action-btn btn-edit" onClick={() => handleEditClick(s)} title="Edit Supplier">
                                <FaEdit className="btn-icon" />
                                <span>Edit</span>
                              </button>
                              <button className="action-btn btn-delete" onClick={() => handleDelete(s._id, s.companyName)} title="Delete Supplier">
                                <FaTrash className="btn-icon" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="empty-row">
                          <div className="empty-state">
                            <FaBuilding className="empty-icon" />
                            <div className="empty-content">
                              <h3>No suppliers found</h3>
                              <p>Try adjusting your search criteria or add a new supplier</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update form modal */}
      {editingSupplier && (
        <div className="uds-modal">
          <div className="uds-modal-content">
            <h3>Update Supplier</h3>
            <form onSubmit={handleUpdate}>
              <label>
                Company Name
                <input name="companyName" value={formData.companyName} onChange={handleChange} required />
              </label>
              <label>
                Contact Name
                <input name="contactName" value={formData.contactName} onChange={handleChange} required />
              </label>
              <label>
                Email
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </label>
              <label>
                Phone
                <input name="phone" value={formData.phone} onChange={handleChange} required />
              </label>
              <label className="materials-label">
                Materials & Pricing
              </label>
              
              {/* Add Material Section */}
              <div className="add-material-container">
                <div className="material-input-row">
                  <div className="material-input-group">
                    <label className="material-input-label">Material Name</label>
                    <input
                      type="text"
                      name="name"
                      value={currentMaterial.name}
                      onChange={handleMaterialChange}
                      placeholder="e.g. Wood, Glass, Metal"
                      className="material-input-field"
                    />
                  </div>
                  <div className="material-input-group">
                    <label className="material-input-label">Price per Unit ($)</label>
                    <input
                      type="number"
                      name="pricePerUnit"
                      value={currentMaterial.pricePerUnit}
                      onChange={handleMaterialChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="material-input-field"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={addMaterial}
                    className="add-material-btn"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Materials List */}
              {formData.materials.length > 0 && (
                <div className="materials-list">
                  {formData.materials.map((material, index) => (
                    <div key={index} className="material-item-edit">
                      <span className="material-name-edit">{material.name}</span>
                      <span className="material-price-edit">${material.pricePerUnit.toFixed(2)}/unit</span>
                      <button 
                        type="button" 
                        onClick={() => removeMaterial(index)}
                        className="remove-material-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label>
                Legacy Material Types (comma separated)
                <input 
                  name="materialTypes" 
                  value={formData.materialTypes} 
                  onChange={handleChange}
                  placeholder="For backward compatibility only" 
                  className="no-materials-text"
                />
              </label>
              <label>
                Regions (comma separated)
                <input name="deliveryRegions" value={formData.deliveryRegions} onChange={handleChange} />
              </label>

              <div className="uds-form-actions">
                <button type="submit" className="uds-save-btn">Confirm</button>
                <button type="button" className="uds-cancel-btn" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Update_delete_suppliers;
