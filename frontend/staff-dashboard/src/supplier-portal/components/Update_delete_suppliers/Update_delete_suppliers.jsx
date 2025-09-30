import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Update_delete_suppliers.css";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

const API_BASE = "http://localhost:4000/api/suppliers"; // your backend

function Update_delete_suppliers() {
  const [suppliers, setSuppliers] = useState([]);
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
      setSuppliers(res.data);
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

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="uds-page">
        <h2>Suppliers</h2>

      <table className="uds-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Company</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Materials</th>
            <th>Regions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s, i) => (
            <tr key={s._id}>
              <td>{i + 1}</td>
              <td>{s.companyName}</td>
              <td>{s.contactName}</td>
              <td>{s.email}</td>
              <td>{s.phone}</td>
              <td>{s.materialTypes?.join(", ")}</td>
              <td>{s.deliveryRegions?.join(", ")}</td>
              <td>
                <button className="uds-edit-btn" onClick={() => handleEditClick(s)}>
                  Update
                </button>
                <button className="uds-delete-btn" onClick={() => handleDelete(s._id, s.companyName)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
    </div>
  );
}

export default Update_delete_suppliers;
