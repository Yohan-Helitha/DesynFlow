import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RateSupplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: "",
    criteria: { timeliness: 0, quality: 0, communication: 0 }
  });
  const navigate = useNavigate();

  // Resolve API base (backend actually running on 3000 by default)
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

  // Fetch suppliers
  useEffect(() => {
    fetch(`${API_BASE}/api/suppliers`)
      .then(res => {
        if (!res.ok) throw new Error(`Supplier fetch failed ${res.status}`);
        return res.json();
      })
      .then(data => setSuppliers(data))
      .catch(err => console.error("Failed to fetch suppliers", err));
  }, [API_BASE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["timeliness", "quality", "communication"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        criteria: { ...prev.criteria, [name]: Number(value) }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      alert("Please select a supplier");
      return;
    }
    try {
      let res = await fetch(`${API_BASE}/api/supplierRating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Submit failed (${res.status}): ${errText}`);
      }
      const data = await res.json();
      // Optional: show computed weighted score
      alert(`Rating submitted. Weighted Score: ${data.weightedScore?.toFixed ? data.weightedScore.toFixed(2) : data.weightedScore}`);
      setFormData({
        supplierId: "",
        criteria: { timeliness: 0, quality: 0, communication: 0 }
      });
      // Pass state so Supplier_details can force re-fetch
      navigate("/Supplier_details", { state: { justRated: true, ratedSupplierId: data.supplierId, ts: Date.now() } });
    } catch (err) {
      console.error("Error submitting rating", err);
      alert("Failed to submit rating. Check console for details.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Rate a Supplier</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Supplier:
          <select
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.companyName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Timeliness (0-5):
          <input
            type="number"
            name="timeliness"
            value={formData.criteria.timeliness}
            min="0"
            max="5"
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Quality (0-5):
          <input
            type="number"
            name="quality"
            value={formData.criteria.quality}
            min="0"
            max="5"
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Communication (0-5):
          <input
            type="number"
            name="communication"
            value={formData.criteria.communication}
            min="0"
            max="5"
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Submit Rating</button>
      </form>
    </div>
  );
}

export default RateSupplier;
