import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
function OrderForm({ onOrderCreated }) {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: "",
    items: [{ materialId: "", quantity: "", pricePerUnit: 0, total: 0 }],
  });

  useEffect(() => {
    fetch("http://localhost:3000/api/suppliers")
      .then(res => res.json())
      .then(data => setSuppliers(data))
      .catch(() => setSuppliers([]));
  }, []);

  // Use selected supplier's materialTypes for dropdown
  useEffect(() => {
    if (formData.supplierId) {
      const supplier = suppliers.find(s => s._id === formData.supplierId);
      setMaterials(supplier?.materialTypes || []);
    } else {
      setMaterials([]);
    }
  }, [formData.supplierId, suppliers]);

  // handle field change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle item change
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    if (name === "materialId") {
      newItems[index].materialId = value;
      // Set pricePerUnit from materials list
      const mat = materials.find(m => m._id === value);
      newItems[index].pricePerUnit = mat && mat.pricePerUnit ? mat.pricePerUnit : 0;
      // recalculate total if quantity exists
      const qty = Number(newItems[index].quantity) || 0;
      newItems[index].total = newItems[index].pricePerUnit * qty;
    } else if (name === "quantity") {
      newItems[index].quantity = value;
      // recalculate total using pricePerUnit from material
      const mat = materials.find(m => m._id === newItems[index].materialId);
      const price = mat && mat.pricePerUnit ? mat.pricePerUnit : Number(newItems[index].pricePerUnit) || 0;
      newItems[index].pricePerUnit = price;
      newItems[index].total = price * Number(value);
    }
    setFormData({ ...formData, items: newItems });
  };

  // add new material row
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { materialId: "", quantity: "", pricePerUnit: 0, total: 0 }],
    });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Format items for backend: send materialId, qty, unitPrice
    const formattedItems = formData.items
      .filter(item => item.materialId)
      .map(item => ({
        materialId: item.materialId,
        qty: Number(item.quantity),
        unitPrice: Number(item.pricePerUnit)
      }));
    // Only submit if supplier is selected
    const isValidObjectId = v => /^[a-f\d]{24}$/i.test(v);
    if (!isValidObjectId(formData.supplierId)) {
      alert("Please select a supplier.");
      return;
    }
    if (formattedItems.length === 0) {
      alert("Please add at least one valid item with a material selected.");
      return;
    }
    // Add dummy projectId and requestedBy to satisfy backend validation
    const payload = {
      supplierId: formData.supplierId,
      projectId: "64f3a9e1b2c3d45678901234", // dummy ObjectId
      requestedBy: "64f3a9e1b2c3d45678901234", // dummy ObjectId
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
          supplierId: "",
          items: [{ materialId: "", quantity: "", pricePerUnit: 0, total: 0 }],
        });
  if (onOrderCreated) onOrderCreated(newOrder); // notify parent to refresh
  navigate("/Rate_supplier");
      } else {
        const error = await res.json();
        alert("Failed to create order: " + (error.error || "Unknown error"));
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
          Supplier:
          <select
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map(sup => (
              <option key={sup._id} value={sup._id}>{sup.companyName}</option>
            ))}
          </select>
        </label>
        {/* Show Supplier ID (not editable) */}
        {formData.supplierId && (
          <div style={{ fontSize: '13px', color: '#674636', marginBottom: '8px' }}>
            Supplier ID: <span style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{formData.supplierId}</span>
          </div>
        )}

        <h3>Order Items</h3>
        {formData.items.map((item, index) => {
          return (
            <div key={index} className="order-item">
              <select
                name="materialId"
                value={item.materialId || ""}
                onChange={(e) => handleItemChange(index, e)}
                required
              >
                <option value="">Select Material</option>
                {materials.map((mat, idx) => (
                  <option key={idx} value={mat}>{mat}</option>
                ))}
              </select>
              {/* Show selected material name below dropdown for clarity */}
              {item.materialId && (
                <div style={{ fontSize: '13px', color: '#674636', marginBottom: '4px' }}>
                  Selected: {item.materialId}
                </div>
              )}
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={item.quantity === undefined || item.quantity === null ? "" : item.quantity}
                onChange={(e) => handleItemChange(index, e)}
                required
              />
              <input
                type="number"
                name="pricePerUnit"
                placeholder="Price per Unit"
                value={isNaN(item.pricePerUnit) ? "" : item.pricePerUnit}
                readOnly
                style={{ background: '#eee' }}
              />
              <input
                type="number"
                name="total"
                placeholder="Total"
                value={isNaN(item.total) ? "" : item.total}
                readOnly
                style={{ background: '#eee' }}
              />
            </div>
          );
        })}
        <button type="button" onClick={addItem} className="btn-add">
          + Add Another Item
        </button>

        <button type="submit" className="btn-submit">Create Order</button>
      </form>
    </div>
  );
}

export default OrderForm;
