import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Add_suppliers.css";

function Add_suppliers() {
  const [formData, setFormData] = useState({
    name: "",
    years: "",
    description: "",
    items: "",
    rating: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Supplier Added:", formData);
    alert(`Supplier "${formData.name}" has been added successfully!`);
    setFormData({ name: "", years: "", description: "", items: "", rating: "" });
  };

  return (
    <div className="add-supplier-container">
      <h2>Add New Supplier</h2>

      <form className="add-supplier-form" onSubmit={handleSubmit}>
        {/* Supplier Name */}
        <div className="form-group">
          <label>Supplier Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter supplier name"
            required
          />
        </div>

        {/* Years with Us */}
        <div className="form-group">
          <label>Years with Us</label>
          <input
            type="number"
            name="years"
            value={formData.years}
            onChange={handleChange}
            placeholder="e.g. 5"
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the supplier"
            required
          ></textarea>
        </div>

        {/* Items Supplied */}
        <div className="form-group">
          <label>Items Supplied</label>
          <input
            type="text"
            name="items"
            value={formData.items}
            onChange={handleChange}
            placeholder="Comma-separated items (e.g. Sofas, Curtains, Lights)"
            required
          />
        </div>

        {/* Rating */}
        <div className="form-group">
          <label>Rating (1–5)</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="1"
            max="5"
            step="0.1"
            placeholder="e.g. 4.5"
            required
          />
        </div>

        {/* Submit Button */}
       <div className="form-actions">
  <Link to="/Supplier_details">
    <button type="button" className="submit-btn">Add Supplier (local)</button>
  </Link>
</div>

      </form>
    </div>
  );
}

export default Add_suppliers;