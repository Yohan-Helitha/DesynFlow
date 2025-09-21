import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Update_delete_suppliers.css";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:3000/api/suppliers"; // your backend

function Update_delete_suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [editingSupplier, setEditingSupplier] = useState(null); // holds supplier being edited
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    materialTypes: "",
    deliveryRegions: ""
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
      deliveryRegions: supplier.deliveryRegions?.join(", ") || ""
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
      deliveryRegions: ""
    });
  };

  // update supplier
  const handleUpdate = async (e) => {
    e.preventDefault();

    const updated = {
      ...formData,
      materialTypes: formData.materialTypes.split(",").map((m) => m.trim()),
      deliveryRegions: formData.deliveryRegions.split(",").map((r) => r.trim())
    };

    try {
      await axios.put(`${API_BASE}/${editingSupplier}`, updated);
      alert("✅ Supplier updated!");
      handleCancel();
      fetchSuppliers();
    } catch (err) {
      console.error("Error updating supplier", err);
      alert(" Failed to update supplier");
    }
  };

  // delete supplier
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supplier "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      alert(" Supplier deleted");
      fetchSuppliers();
    } catch (err) {
      console.error("Error deleting supplier", err);
      alert(" Failed to delete supplier");
    }
  };

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
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
              <label>
                Materials (comma separated)
                <input name="materialTypes" value={formData.materialTypes} onChange={handleChange} />
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
