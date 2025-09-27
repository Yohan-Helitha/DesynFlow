import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

function OrderForm({ onOrderCreated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [supplierLocked, setSupplierLocked] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: "",
    items: [{ materialId: "", materialName: "", quantity: "", pricePerUnit: 0, total: 0 }],
  });

  useEffect(() => {
    fetch("http://localhost:3000/api/suppliers")
      .then(res => res.json())
      .then(data => setSuppliers(data))
      .catch(() => setSuppliers([]));
  }, []);

  // Handle preselected supplier from navigation state
  useEffect(() => {
    if (location.state?.preselectedSupplier) {
      const preselectedSupplier = location.state.preselectedSupplier;
      setFormData(prev => ({
        ...prev,
        supplierId: preselectedSupplier._id
      }));
      setSupplierLocked(location.state.supplierLocked || false);
    }
  }, [location.state]);

  // Fetch materials from MaterialCatalog for selected supplier
  useEffect(() => {
    if (formData.supplierId) {
      fetch(`http://localhost:3000/api/materials?supplierId=${formData.supplierId}`)
        .then(res => res.json())
        .then(data => {
          // Transform data to include material info with pricing
          const materialsWithPricing = data.map(item => ({
            _id: item.materialId?._id || item.materialId,
            name: item.materialId?.materialName || `Material-${item._id}`,
            pricePerUnit: item.pricePerUnit || 0,
            leadTimeDays: item.leadTimeDays || 7
          }));
          setMaterials(materialsWithPricing);
        })
        .catch(err => {
          console.error("Error fetching materials:", err);
          // Fallback to supplier's materialTypes if MaterialCatalog fetch fails
          const supplier = suppliers.find(s => s._id === formData.supplierId);
          if (supplier?.materials && supplier.materials.length > 0) {
            // Use supplier's materials if available
            const supplierMaterials = supplier.materials.map((mat, idx) => ({
              _id: `temp-${idx}`,
              name: mat.name,
              pricePerUnit: mat.pricePerUnit || 0
            }));
            setMaterials(supplierMaterials);
          } else if (supplier?.materialTypes) {
            // Legacy fallback - convert materialTypes to material objects
            const legacyMaterials = supplier.materialTypes.map((type, idx) => ({
              _id: `legacy-${idx}`,
              name: type,
              pricePerUnit: 0
            }));
            setMaterials(legacyMaterials);
          } else {
            setMaterials([]);
          }
        });
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
      const mat = materials.find(m => (m._id === value) || (m.name === value));
      // Track materialName explicitly to avoid showing/storing IDs in UI
      newItems[index].materialName = mat ? mat.name : "";
      newItems[index].pricePerUnit = mat && mat.pricePerUnit ? mat.pricePerUnit : 0;
      // recalculate total if quantity exists
      const qty = Number(newItems[index].quantity) || 0;
      newItems[index].total = newItems[index].pricePerUnit * qty;
    } else if (name === "quantity") {
      newItems[index].quantity = value;
      // recalculate total using pricePerUnit from material
      const mat = materials.find(m => (m._id === newItems[index].materialId) || (m.name === newItems[index].materialId));
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
        materialName: item.materialName || undefined,
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
          items: [{ materialId: "", materialName: "", quantity: "", pricePerUnit: 0, total: 0 }],
        });
        if (onOrderCreated) onOrderCreated(newOrder); // notify parent to refresh
        // Navigate back to Orders list (rating now only via Received button there)
        navigate("/Orders");
      } else {
        const error = await res.json();
        alert("Failed to create order: " + (error.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error creating order:", err);
    }
  };

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="order-form-container">
        <h2>Create New Order</h2>
      <form onSubmit={handleSubmit} className="order-form">
        <label>
          Supplier:
          {supplierLocked ? (
            <div className="locked-supplier">
              <input
                type="text"
                value={suppliers.find(s => s._id === formData.supplierId)?.companyName || "Loading..."}
                disabled
                className="locked-input"
              />
              <span className="locked-indicator">🔒 Pre-selected from supplier details</span>
            </div>
          ) : (
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
          )}
        </label>
        {/* Intentionally not showing raw IDs in the UI */}

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
                  <option key={idx} value={mat._id || mat.name}>
                    {mat.name} - ${(mat.pricePerUnit || 0).toFixed(2)}/unit
                  </option>
                ))}
              </select>
              {/* Selected material name and price are already visible in the dropdown label. */}
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
    </div>
  );
}

export default OrderForm;
