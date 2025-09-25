import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function RateSupplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: "",
    criteria: { timeliness: 0, quality: 0, communication: 0 }
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve API base (backend actually running on 3000 by default)
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

  // Fetch suppliers
  useEffect(() => {
    fetch(`${API_BASE}/api/suppliers`)
      .then(res => {
        if (!res.ok) throw new Error(`Supplier fetch failed ${res.status}`);
        return res.json();
      })
      .then(data => {
        setSuppliers(data);
        // If navigated from Orders with a specific supplier, preselect and restrict
        if (location.state?.supplierId) {
          setFormData(prev => ({ ...prev, supplierId: location.state.supplierId }));
        }
      })
      .catch(err => console.error("Failed to fetch suppliers", err));
  }, [API_BASE, location.state?.supplierId]);

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
      const ws = data?.rating?.weightedScore?.toFixed ? Number(data.rating.weightedScore.toFixed(2)) : data?.rating?.weightedScore;
      const avg = data?.averageRating?.toFixed ? Number(data.averageRating.toFixed(2)) : data?.averageRating;
      alert(`Rating submitted. Weighted Score: ${ws} | New Average: ${avg}`);
      setFormData({
        supplierId: "",
        criteria: { timeliness: 0, quality: 0, communication: 0 }
      });
      // Pass state so Supplier_details can force re-fetch
      navigate("/Supplier_details", { state: { justRated: true, ratedSupplierId: data?.rating?.supplierId || data?.rating?.supplier || data?.supplierId, weightedScore: avg ?? ws, averageRating: avg, ts: Date.now() } });
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
            disabled={!!location.state?.supplierId}
          >
            {!location.state?.supplierId && <option value="">Select Supplier</option>}
            {location.state?.supplierId
              ? suppliers.filter(s => s._id === location.state.supplierId).map(s => (
                  <option key={s._id} value={s._id}>{s.companyName}</option>
                ))
              : suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.companyName}</option>
                ))}
          </select>
          {location.state?.orderId && (
            <div style={{ fontSize: '12px', marginTop: '4px', color: '#555' }}>
              Rating for Order: <strong>{location.state.orderId}</strong>
            </div>
          )}
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
