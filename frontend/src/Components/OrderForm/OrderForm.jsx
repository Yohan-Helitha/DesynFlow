import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./OrderForm.css";


// Permanent price per unit for each material
const MATERIAL_PRICES = {
  wood: 50,
  fabric: 30,
  net: 20,
  glue: 10,
  glass: 100
};

function OrderForm({ onOrderCreated }) {
  const [formData, setFormData] = useState({
    projectId: "",
    supplierId: "",
    requestedBy: "",
    items: [{ materialName: "", quantity: "", pricePerUnit: 0, total: 0 }],
  });

  // handle field change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  // handle item change
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    if (name === "materialName") {
      const price = MATERIAL_PRICES[value.trim().toLowerCase()] || 0;
      newItems[index].materialName = value;
      newItems[index].pricePerUnit = price;
      // recalculate total if quantity exists
      const qty = Number(newItems[index].quantity) || 0;
      newItems[index].total = price * qty;
    } else if (name === "quantity") {
      newItems[index].quantity = value;
      const price = Number(newItems[index].pricePerUnit) || 0;
      newItems[index].total = price * Number(value);
    }
    setFormData({ ...formData, items: newItems });
  };


  // add new material row
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { materialName: "", quantity: "", pricePerUnit: 0, total: 0 }],
    });
  };


  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Format items for backend
    const formattedItems = formData.items.map(item => {
      // If materialName looks like an ObjectId, send as materialId, else send as materialName
      const isObjectId = /^[a-f\d]{24}$/i.test(item.materialName.trim());
      return isObjectId
        ? { materialId: item.materialName.trim(), qty: Number(item.quantity), unitPrice: Number(item.pricePerUnit) }
        : { materialName: item.materialName.trim(), qty: Number(item.quantity), unitPrice: Number(item.pricePerUnit) };
    });
    const payload = {
      ...formData,
      items: formattedItems
    };
    try {
      const res = await fetch("http://localhost:3000/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newOrder = await res.json();
        alert("Order created successfully!");
        setFormData({
          projectId: "",
          supplierId: "",
          requestedBy: "",
          items: [{ materialName: "", quantity: "", pricePerUnit: 0, total: 0 }],
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
              placeholder="Material Name (wood, fabric, net, glue, glass)"
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
              readOnly
              style={{ background: '#eee' }}
            />
            <input
              type="number"
              name="total"
              placeholder="Total"
              value={item.total}
              readOnly
              style={{ background: '#eee' }}
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
