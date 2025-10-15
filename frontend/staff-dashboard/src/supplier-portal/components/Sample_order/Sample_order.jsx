import React, { useEffect, useState } from "react";
import "./Sample_order.css";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

function Sample_order() {
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: "",
    materialId: "",
    requestedBy: "64f3a9e1b2c3d4567890", // Example officer ID, replace dynamically if needed
    reviewNote: ""
  });

  // Fetch suppliers from backend
  useEffect(() => {
    fetch("http://localhost:4000/api/suppliers")
      .then((res) => res.json())
      .then((data) => {
        // Sort suppliers by creation date - newest first
        const sortedSuppliers = data.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
          return dateB - dateA; // Newest first
        });
        setSuppliers(sortedSuppliers);
      })
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  // Fetch materials from MaterialCatalog or use supplier's materials
  useEffect(() => {
    if (formData.supplierId) {
      // First try to fetch from MaterialCatalog
      fetch(`http://localhost:4000/api/materials?supplierId=${formData.supplierId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            // Transform MaterialCatalog data
            const materialsWithPricing = data.map(item => ({
              _id: item.materialId?._id || item.materialId,
              name: item.materialId?.materialName || `Material-${item._id}`,
              pricePerUnit: item.pricePerUnit || 0
            }));
            setMaterials(materialsWithPricing);
          } else {
            // Fallback to supplier's materials or materialTypes
            const supplier = suppliers.find(s => s._id === formData.supplierId);
            if (supplier?.materials && supplier.materials.length > 0) {
              const supplierMaterials = supplier.materials.map((mat, idx) => ({
                _id: `temp-${idx}`,
                name: mat.name,
                pricePerUnit: mat.pricePerUnit || 0
              }));
              setMaterials(supplierMaterials);
            } else {
              setMaterials(supplier?.materialTypes?.map((type, idx) => ({
                _id: `legacy-${idx}`, 
                name: type, 
                pricePerUnit: 0
              })) || []);
            }
          }
        })
        .catch(err => {
          console.error("Error fetching materials:", err);
          // Fallback to supplier data
          const supplier = suppliers.find(s => s._id === formData.supplierId);
          if (supplier?.materials && supplier.materials.length > 0) {
            const supplierMaterials = supplier.materials.map((mat, idx) => ({
              _id: `temp-${idx}`,
              name: mat.name,
              pricePerUnit: mat.pricePerUnit || 0
            }));
            setMaterials(supplierMaterials);
          } else {
            setMaterials(supplier?.materialTypes?.map((type, idx) => ({
              _id: `legacy-${idx}`, 
              name: type, 
              pricePerUnit: 0
            })) || []);
          }
        });
    } else {
      setMaterials([]);
    }
  }, [formData.supplierId, suppliers]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only send ObjectIds for materialId, supplierId, requestedBy
    const payload = {
      supplierId: formData.supplierId,
      materialId: formData.materialId,
      requestedBy: formData.requestedBy,
      reviewNote: formData.reviewNote
    };
          console.log('Submitting sample order payload:', payload);
          fetch("http://localhost:4000/api/samples/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to request sample");
        return res.json();
      })
      .then(() => {
  console.log('Sample request sent successfully!');
        setFormData({
          supplierId: "",
          materialId: "",
          requestedBy: "64f3a9e1b2c3d4567890",
          reviewNote: ""
        });
      })
      .catch((err) => {
        console.error(err);
  console.error('Error sending request');
      });
  };

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="sample-order-page">
        <h2>📨 Request Material Sample</h2>

      <form className="sample-order-form" onSubmit={handleSubmit}>
        {/* Supplier Selection */}
        <div className="form-group">
          <label>Supplier</label>
          <select
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.companyName}
              </option>
            ))}
          </select>
        </div>

        {/* Material Selection */}
        <div className="form-group">
          <label>Material</label>
          {formData.supplierId && materials.length === 0 ? (
            <div className="no-materials-message">
              No materials found for this supplier.
            </div>
          ) : null}
          <select
            name="materialId"
            value={formData.materialId}
            onChange={handleChange}
            required
            className="material-select"
            disabled={materials.length === 0}
          >
            <option value="">-- Select Material --</option>
            {materials.map((mat, idx) => (
              <option key={idx} value={mat._id || mat.name}>
                {mat.name} {mat.pricePerUnit > 0 ? `- $${mat.pricePerUnit.toFixed(2)}/unit` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Optional Note */}
        <div className="form-group">
          <label>Note (Optional)</label>
          <textarea
            name="reviewNote"
            value={formData.reviewNote}
            onChange={handleChange}
            placeholder="Any specific request or details..."
          />
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            ➕ Request Sample
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}

export default Sample_order;
