import React, { useEffect, useState } from "react";
import "./Rate_supplier.css";

function Rate_supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [timeliness, setTimeliness] = useState(0);
  const [productQuality, setProductQuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [message, setMessage] = useState("");

  // Fetch supplier list
  useEffect(() => {
    fetch("http://localhost:3000/supplier")
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  // Handle submit rating
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSupplier) {
      setMessage("⚠ Please select a supplier");
      return;
    }

    const ratingData = {
      supplierId: selectedSupplier,
      timeliness: Number(timeliness),
      productQuality: Number(productQuality),
      communication: Number(communication),
    };

    try {
      const res = await fetch("http://localhost:3000/supplier-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratingData),
      });

      if (res.ok) {
        setMessage("✅ Rating submitted successfully!");
        setTimeliness(0);
        setProductQuality(0);
        setCommunication(0);
        setSelectedSupplier("");
      } else {
        const error = await res.json();
        setMessage("❌ " + error.error);
      }
    } catch (err) {
      setMessage("❌ Error submitting rating: " + err.message);
    }
  };

  return (
    <div className="rate-supplier-container">
      <h2>Rate a Supplier</h2>

      <form onSubmit={handleSubmit} className="rate-form">
        <label>
          Select Supplier:
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="">-- Choose Supplier --</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.companyName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Timeliness (0–5):
          <input
            type="number"
            min="0"
            max="5"
            value={timeliness}
            onChange={(e) => setTimeliness(e.target.value)}
          />
        </label>

        <label>
          Quality (0–5):
          <input
            type="number"
            min="0"
            max="5"
            value={productQuality}
            onChange={(e) => setProductQuality(e.target.value)}
          />
        </label>

        <label>
          Communication (0–5):
          <input
            type="number"
            min="0"
            max="5"
            value={communication}
            onChange={(e) => setCommunication(e.target.value)}
          />
        </label>

        <button type="submit" className="submit-btn">
          Submit Rating
        </button>
      </form>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
}

export default Rate_supplier;
