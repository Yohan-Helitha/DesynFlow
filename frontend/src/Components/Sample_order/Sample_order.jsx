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

  // Fetch materials for selected supplier
  useEffect(() => {
    if (formData.supplierId) {
      fetch(`http://localhost:3000/api/materials?supplierId=${formData.supplierId}`)
        .then(res => res.json())
        .then(data => setMaterials(data))
        .catch(() => setMaterials([]));
    } else {
      setMaterials([]);
    }
  }, [formData.supplierId]);

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
          <select
            name="materialId"
            value={formData.materialId}
            onChange={handleChange}
            required
            style={{ color: '#000' }}
          >
            <option value="">-- Select Material --</option>
            {materials.map((mat) => (
              <option key={mat._id} value={mat._id}>{mat.name || mat.materialName || mat.materialType}</option>
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
