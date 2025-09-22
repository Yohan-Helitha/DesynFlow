import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./OrderForm.css";

function OrderForm({ onOrderCreated }) {
  const [formData, setFormData] = useState({
    projectId: "",
    supplierId: "",
    requestedBy: "",
    items: [{ materialName: "", quantity: "", pricePerUnit: "" }],
  });

  // handle field change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle item change
  const handleItemChange = (index, e) => {
    const newItems = [...formData.items];
    newItems[index][e.target.name] = e.target.value;
    setFormData({ ...formData, items: newItems });
  };

  // add new material row
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { materialName: "", quantity: "", pricePerUnit: "" }],
    });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newOrder = await res.json();
        alert("Order created successfully!");
        setFormData({
          projectId: "",
          supplierId: "",
          requestedBy: "",
          items: [{ materialName: "", quantity: "", pricePerUnit: "" }],
        });
        if (onOrderCreated) onOrderCreated(newOrder); // notify parent to refresh
      } else {
        alert("Failed to create order.");
      }
    } catch (err) {
      console.error("Error creating order:", err);
    }
  };

  return (
    <div className="order-form-container">
      <h2>Create New Order</h2>
      <form onSubmit={handleSubmit} className="order-form">
        <label>
          Project ID:
          <input
            type="text"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Supplier ID:
          <input
            type="text"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Requested By (User ID):
          <input
            type="text"
            name="requestedBy"
            value={formData.requestedBy}
            onChange={handleChange}
            required
          />
        </label>

        <h3>Order Items</h3>
        {formData.items.map((item, index) => (
          <div key={index} className="order-item">
            <input
              type="text"
              name="materialName"
              placeholder="Material Name"
              value={item.materialName}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <input
              type="number"
              name="pricePerUnit"
              placeholder="Price per Unit"
              value={item.pricePerUnit}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addItem} className="btn-add">
          + Add Another Item
        </button>

        <button type="submit" className="btn-submit">Create Order</button>
      </form>
    </div>
  );
}

export default OrderForm;
