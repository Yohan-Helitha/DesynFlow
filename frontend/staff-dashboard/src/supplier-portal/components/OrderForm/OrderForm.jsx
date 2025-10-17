import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./OrderForm.css";

function OrderForm({ onOrderCreated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [supplierLocked, setSupplierLocked] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: "",
    items: [{ materialId: "", materialName: "", quantity: "", unit: "", pricePerUnit: 0, total: 0 }],
  });

  useEffect(() => {
    fetch("/api/suppliers")
      .then(res => res.json())
      .then(data => {
        // Sort suppliers by creation date - newest first
        const sortedSuppliers = data.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
          return dateB - dateA; // Newest first
        });
        setSuppliers(sortedSuppliers);
      })
      .catch(() => setSuppliers([]));
  }, []);

  // Handle preselected supplier from navigation state or sessionStorage
  useEffect(() => {
    let supplierData = null;
    
    // First try navigation state
    if (location.state?.preselectedSupplier) {
      supplierData = {
        preselectedSupplier: location.state.preselectedSupplier,
        supplierLocked: location.state.supplierLocked || false
      };
    } else {
      // Fallback to sessionStorage
      try {
        const stored = sessionStorage.getItem('preselectedSupplier');
        if (stored) {
          supplierData = JSON.parse(stored);
          // Clear sessionStorage after use
          sessionStorage.removeItem('preselectedSupplier');
        }
      } catch (error) {
        console.error('Error reading sessionStorage:', error);
      }
    }
    
    if (supplierData?.preselectedSupplier) {
      console.log('Setting preselected supplier:', supplierData.preselectedSupplier);
      setFormData(prev => ({
        ...prev,
        supplierId: supplierData.preselectedSupplier._id
      }));
      setSupplierLocked(supplierData.supplierLocked || false);
    }
  }, [location.state]);

  // Fetch materials from MaterialCatalog for selected supplier
  useEffect(() => {
    if (formData.supplierId) {
      fetch(`/api/materials?supplierId=${formData.supplierId}`)
        .then(res => res.json())
        .then(data => {
          // Transform data to include material info with pricing (unit will be selected by user)
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
      // Set pricePerUnit from materials list, but keep unit selection independent
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
    } else if (name === "unit") {
      newItems[index].unit = value;
    }
    setFormData({ ...formData, items: newItems });
  };

  // add new material row
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { materialId: "", materialName: "", quantity: "", unit: "", pricePerUnit: 0, total: 0 }],
    });
  };

  // remove material row
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Format items for backend: send materialId, qty, unit, unitPrice
    console.log('Form data items before formatting:', formData.items);
    
    const formattedItems = formData.items
      .filter(item => item.materialId && item.unit && item.quantity)
      .map(item => ({
        materialId: item.materialId,
        materialName: item.materialName || undefined,
        qty: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.pricePerUnit)
      }));
    
    console.log('Sending items with units:', formattedItems);
    // Only submit if supplier is selected
    const isValidObjectId = v => /^[a-f\d]{24}$/i.test(v);
    if (!isValidObjectId(formData.supplierId)) {
      console.warn('Please select a supplier.');
      return;
    }
    if (formattedItems.length === 0) {
      console.warn('Please add at least one valid item with material, unit, and quantity selected.');
      return;
    }
    // Compute required fields for backend schema
    const totalAmount = formattedItems.reduce((sum, it) => sum + (Number(it.unitPrice) * Number(it.qty || 0)), 0);
    const supplierName = suppliers.find(s => s._id === formData.supplierId)?.companyName || 'Supplier';
    const safeSupplier = supplierName.replace(/\s+/g, '').slice(0, 16) || 'Supplier';
    const dateTag = new Date().toISOString().slice(0, 10);
    const orderName = `PO-${safeSupplier}-${dateTag}`;
    const requestOrigin = (location.state?.fromRestockAlert) ? 'ReorderAlert' : 'Manual';
    // Add dummy projectId and requestedBy to satisfy backend validation
    const payload = {
      name: orderName,
      requestOrigin,
      totalAmount,
      supplierId: formData.supplierId,
      projectId: "64f3a9e1b2c3d45678901234", // dummy ObjectId
      requestedBy: "64f3a9e1b2c3d45678901234", // dummy ObjectId
      items: formattedItems
    };
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newOrder = await res.json();
  console.log('Order created successfully!');
        setFormData({
          supplierId: "",
          items: [{ materialId: "", materialName: "", quantity: "", unit: "", pricePerUnit: 0, total: 0 }],
        });
        if (onOrderCreated) onOrderCreated(newOrder); // notify parent to refresh
        // Navigate back to Orders list (rating now only via Received button there)
        navigate("/procurement-officer/orders", {
          state: {
            newOrderCreated: true,
            orderData: newOrder
          }
        });
      } else {
        const error = await res.json();
  console.error('Failed to create order: ' + (error.error || 'Unknown error'));
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
              <div className="form-field">
                <label htmlFor={`material-${index}`}>Material</label>
                <select
                  id={`material-${index}`}
                  name="materialId"
                  value={item.materialId || ""}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                >
                  <option value="">Select Material</option>
                  {materials.map((mat, idx) => (
                    <option key={idx} value={mat._id || mat.name}>
                      {mat.name} - LKR {(mat.pricePerUnit || 0).toFixed(2)}/unit
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor={`quantity-${index}`}>Quantity</label>
                <input
                  id={`quantity-${index}`}
                  type="number"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={item.quantity === undefined || item.quantity === null ? "" : item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor={`unit-${index}`}>Unit Type</label>
                <select
                  id={`unit-${index}`}
                  name="unit"
                  value={item.unit || ""}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                  title="Select unit type"
                >
                  <option value="">Select Unit</option>
                  <option value="Kilo">Kilo</option>
                  <option value="Meters">Meters</option>
                  <option value="Liters">Liters</option>
                  <option value="pieces">Pieces</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor={`pricePerUnit-${index}`}>Price per Unit</label>
                <input
                  id={`pricePerUnit-${index}`}
                  type="number"
                  name="pricePerUnit"
                  placeholder="LKR 0.00"
                  value={isNaN(item.pricePerUnit) ? "" : item.pricePerUnit}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor={`total-${index}`}>Total Amount</label>
                <input
                  id={`total-${index}`}
                  type="number"
                  name="total"
                  placeholder="LKR 0.00"
                  value={isNaN(item.total) ? "" : item.total}
                  readOnly
                  className="readonly-input"
                />
              </div>

              {formData.items.length > 1 && (
                <div className="form-field">
                  <button 
                    type="button" 
                    onClick={() => removeItem(index)} 
                    className="btn-remove"
                    title="Remove this item"
                  >
                    ✕
                  </button>
                </div>
              )}
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

