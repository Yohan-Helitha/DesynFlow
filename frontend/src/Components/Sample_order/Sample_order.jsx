import React, { useEffect, useState } from "react";
import "./Sample_order.css";
import { Link } from "react-router-dom";

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
    fetch("http://localhost:3000/api/suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  // Update materials from selected supplier's materialTypes
  useEffect(() => {
    if (formData.supplierId) {
      const supplier = suppliers.find(s => s._id === formData.supplierId);
      setMaterials(supplier?.materialTypes || []);
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
          fetch("http://localhost:3000/api/samples/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to request sample");
        return res.json();
      })
      .then(() => {
        alert("Sample request sent successfully!");
        setFormData({
          supplierId: "",
          materialId: "",
          requestedBy: "64f3a9e1b2c3d4567890",
          reviewNote: ""
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Error sending request");
      });
  };

  return (
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
            <div style={{ color: '#674636', background: '#FFF8E8', padding: '8px', borderRadius: '6px', marginBottom: '8px', textAlign: 'center' }}>
              No materials found for this supplier.
            </div>
          ) : null}
          <select
            name="materialId"
            value={formData.materialId}
            onChange={handleChange}
            required
            style={{ color: '#674636', background: '#F7EED3' }}
            disabled={materials.length === 0}
          >
            <option value="">-- Select Material --</option>
            {materials.map((mat, idx) => (
              <option key={idx} value={mat}>{mat}</option>
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
  );
}

export default Sample_order;
