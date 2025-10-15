import React, { useEffect, useState } from "react";
import "./Sample_order.css";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

function Sample_order() {
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    supplierId: "",
    materialId: "",
    requestedBy: "670e8b4e1234567890abcdef", // Default procurement officer ID
    reviewNote: ""
  });

  // Fetch suppliers from backend
  useEffect(() => {
    fetch("http://localhost:4000/api/suppliers")
      .then((res) => res.json())
      .then((data) => {
        // Sort suppliers by creation date - newest first
        const sortedSuppliers = data.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
          return dateB - dateA; // Newest first
        });
        setSuppliers(sortedSuppliers);
      })
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  // Fetch materials available from the selected supplier
  useEffect(() => {
    if (formData.supplierId) {
      console.log('Fetching materials for supplier:', formData.supplierId);
      
      // First try to fetch from MaterialCatalog (materials with pricing from specific supplier)
      fetch(`http://localhost:4000/api/materials?supplierId=${formData.supplierId}`)
        .then(res => res.json())
        .then(data => {
          console.log('MaterialCatalog response:', data);
          
          if (data && data.length > 0) {
            // Transform MaterialCatalog data
            const materialsWithPricing = data.map(item => ({
              _id: item.materialId?._id || item.materialId,
              name: item.materialId?.materialName || item.materialName || `Material-${item._id}`,
              pricePerUnit: item.pricePerUnit || 0,
              unit: item.materialId?.unit || item.unit || 'unit'
            }));
            setMaterials(materialsWithPricing);
            console.log('Set materials from catalog:', materialsWithPricing);
          } else {
            // Fallback to supplier's direct materials list
            console.log('No catalog materials found, using supplier data');
            const supplier = suppliers.find(s => s._id === formData.supplierId);
            
            if (supplier?.materials && supplier.materials.length > 0) {
              const supplierMaterials = supplier.materials.map((mat, idx) => ({
                _id: mat._id || `temp-${idx}`,
                name: mat.name || mat.materialName || `Material ${idx + 1}`,
                pricePerUnit: mat.pricePerUnit || mat.price || 0,
                unit: mat.unit || 'unit'
              }));
              setMaterials(supplierMaterials);
              console.log('Set materials from supplier.materials:', supplierMaterials);
            } else if (supplier?.materialTypes && supplier.materialTypes.length > 0) {
              // Legacy support for materialTypes array
              const legacyMaterials = supplier.materialTypes.map((type, idx) => ({
                _id: `legacy-${idx}`, 
                name: type, 
                pricePerUnit: 0,
                unit: 'unit'
              }));
              setMaterials(legacyMaterials);
              console.log('Set materials from supplier.materialTypes:', legacyMaterials);
            } else {
              setMaterials([]);
              console.log('No materials found for this supplier');
            }
          }
        })
        .catch(err => {
          console.error("Error fetching materials from API:", err);
          
          // Fallback to supplier data on API error
          const supplier = suppliers.find(s => s._id === formData.supplierId);
          if (supplier?.materials && supplier.materials.length > 0) {
            const supplierMaterials = supplier.materials.map((mat, idx) => ({
              _id: mat._id || `temp-${idx}`,
              name: mat.name || mat.materialName || `Material ${idx + 1}`,
              pricePerUnit: mat.pricePerUnit || mat.price || 0,
              unit: mat.unit || 'unit'
            }));
            setMaterials(supplierMaterials);
            console.log('Fallback: Set materials from supplier.materials:', supplierMaterials);
          } else if (supplier?.materialTypes && supplier.materialTypes.length > 0) {
            const legacyMaterials = supplier.materialTypes.map((type, idx) => ({
              _id: `legacy-${idx}`, 
              name: type, 
              pricePerUnit: 0,
              unit: 'unit'
            }));
            setMaterials(legacyMaterials);
            console.log('Fallback: Set materials from supplier.materialTypes:', legacyMaterials);
          } else {
            setMaterials([]);
            console.log('Fallback: No materials found for this supplier');
          }
        });
    } else {
      setMaterials([]);
      console.log('No supplier selected, cleared materials');
    }
  }, [formData.supplierId, suppliers]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Only send ObjectIds for materialId, supplierId, requestedBy
    const payload = {
      supplierId: formData.supplierId,
      materialId: formData.materialId,
      requestedBy: formData.requestedBy,
      reviewNote: formData.reviewNote
    };
    
    console.log('Submitting sample order payload:', payload);
    
    fetch("http://localhost:4000/api/samples/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Failed to request sample: ${errorData.error || res.statusText}`);
        }
        return res.json();
      })
      .then((response) => {
        console.log('Sample request sent successfully!', response);
        
        // Show success message
        alert('Sample request submitted successfully! The request has been sent to the supplier and is now visible in the system.');
        
        // Reset form
        setFormData({
          supplierId: "",
          materialId: "",
          requestedBy: "64f3a9e1b2c3d4567890",
          reviewNote: ""
        });
        
        // Navigate to sample order list to show the submitted request
        navigate('/procurement-officer/sample_order_list');
      })
      .catch((err) => {
        console.error('Error sending request:', err);
        alert('Error submitting sample request. Please try again.');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="page-with-sidebar">
      <Sidebar />
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
          <label>Material Available from This Supplier</label>
          {!formData.supplierId ? (
            <div className="info-message">
              Please select a supplier first to see available materials.
            </div>
          ) : materials.length === 0 ? (
            <div className="no-materials-message">
              No materials found for this supplier. The supplier may not have uploaded their material catalog yet.
            </div>
          ) : (
            <div className="materials-info">
              Found {materials.length} material(s) from this supplier
            </div>
          )}
          <select
            name="materialId"
            value={formData.materialId}
            onChange={handleChange}
            required
            className="material-select"
            disabled={!formData.supplierId || materials.length === 0}
          >
            <option value="">
              {!formData.supplierId 
                ? "-- Select Supplier First --" 
                : materials.length === 0 
                ? "-- No Materials Available --" 
                : "-- Select Material --"}
            </option>
            {materials.map((mat, idx) => (
              <option key={idx} value={mat._id || mat.name}>
                {mat.name} 
                {mat.pricePerUnit > 0 ? ` - LKR ${mat.pricePerUnit.toFixed(2)}/${mat.unit || 'unit'}` : ' - Price not specified'}
              </option>
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
          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting || !formData.supplierId || !formData.materialId}
          >
            {submitting ? "⏳ Submitting..." : "➕ Request Sample"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}

export default Sample_order;
