import React, { useEffect, useMemo, useState } from 'react';
import './Budget_approval_form.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

function Budget_approval_form() {
  const navigate = useNavigate();
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Preselect supplier/material if provided via navigation state
  useEffect(() => {
    const state = location.state || {};
    const pre = state.preselectedSupplier;
    if (pre?._id) {
      setSelectedSupplierId(pre._id);
    }
    // Optional: preselect material by name if passed
    if (state.preselectedMaterialName && materials.length) {
      const match = materials.find(m => m.materialName?.toLowerCase() === state.preselectedMaterialName.toLowerCase());
      if (match) setSelectedMaterialId(match.materialId);
    }
  }, [location.state, materials]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const res = await axios.get('/api/suppliers');
        setSuppliers(res.data || []);
      } catch (err) {
        console.error('Failed to load suppliers', err);
        toast.error('Failed to load suppliers.');
      }
    };
    loadSuppliers();
  }, []);

  useEffect(() => {
    const loadMaterials = async () => {
      if (!selectedSupplierId) {
        setMaterials([]);
        setSelectedMaterialId('');
        return;
      }
      try {
        const res = await axios.get('/api/materials', { params: { supplierId: selectedSupplierId } });
        let mapped = (res.data || []).map((cat) => ({
          catalogId: cat._id,
          materialId: cat.materialId?._id || cat.materialId,
          materialName: cat.materialId?.materialName || 'Unknown',
          unit: cat.materialId?.unit || '',
          pricePerUnit: cat.pricePerUnit ?? 0,
        }));
        // Fallback to supplier.materials if catalog is empty
        if (!mapped.length) {
          const supplier = suppliers.find(s => s._id === selectedSupplierId);
          if (supplier?.materials?.length) {
            mapped = supplier.materials.map((m, idx) => ({
              catalogId: `embedded-${idx}`,
              materialId: m.name, // no id available; use name as key
              materialName: m.name,
              unit: '',
              pricePerUnit: m.pricePerUnit ?? 0,
            }));
          }
        }
        setMaterials(mapped);
        setSelectedMaterialId('');
      } catch (err) {
        console.error('Failed to load materials', err);
        // Try fallback if API errored
        const supplier = suppliers.find(s => s._id === selectedSupplierId);
        if (supplier?.materials?.length) {
          const mapped = supplier.materials.map((m, idx) => ({
            catalogId: `embedded-${idx}`,
            materialId: m.name,
            materialName: m.name,
            unit: '',
            pricePerUnit: m.pricePerUnit ?? 0,
          }));
          setMaterials(mapped);
        } else {
          toast.error('Failed to load materials.');
          setMaterials([]);
        }
        setSelectedMaterialId('');
      }
    };
    loadMaterials();
  }, [selectedSupplierId, suppliers]);

  const selectedSupplier = useMemo(() => suppliers.find(s => s._id === selectedSupplierId), [suppliers, selectedSupplierId]);
  const selectedMaterial = useMemo(() => materials.find(m => m.materialId === selectedMaterialId), [materials, selectedMaterialId]);
  const estimatedBudget = useMemo(() => {
    const price = selectedMaterial?.pricePerUnit || 0;
    const qty = Number(quantity) || 0;
    return price * qty;
  }, [selectedMaterial, quantity]);
  // handle form submit
  function handleSubmit(e) {
    e.preventDefault();

    const materialId = selectedMaterialId;
    const materialName = selectedMaterial?.materialName || '';
    const supplierName = selectedSupplier?.companyName || '';
    const supplierId = selectedSupplierId;
    const budget = estimatedBudget;

    if (!materialId || !materialName || !quantity || !supplierName || !supplierId) {
      toast.warning('Please fill in all fields before submitting.');
      return;
    }

    if (quantity <= 0 || budget <= 0) {
      toast.error('Quantity and Budget must be greater than 0.');
      return;
    }

    // TODO: Integrate with backend endpoint when available.
    // For now, simulate success and navigate back.
    toast.success('Budget approval request submitted');
    // e.target.reset();
    navigate('/procurement-officer/budget_approval');
  }

  function handleCancel() {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      const form = document.querySelector('.budget-form');
      if (form) form.reset();
      navigate('/procurement-officer/budget_approval');
    }
  }

  return (
    <div className="form-wrapper">
      <form className="budget-form" onSubmit={handleSubmit}>
        <div className="header-with-back">
          <button type="button" className="back-to-suppliers-btn" onClick={() => navigate('/procurement-officer/budget_approval')}>
            ← Back to Budget Approvals
          </button>
          <h2>Budget Approval Request</h2>
        </div>

        {/* Supplier Dropdown */}
        <div className="form-group">
          <label htmlFor="supplierName">Supplier</label>
          <select
            id="supplierName"
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
          >
            <option value="">Select a supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.companyName} {s.contactName ? `- ${s.contactName}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Material Dropdown */}
        <div className="form-group">
          <label htmlFor="materialName">Material</label>
          <select
            id="materialName"
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            disabled={!selectedSupplierId || materials.length === 0}
          >
            <option value="">{!selectedSupplierId ? 'Select a supplier first' : (materials.length ? 'Select a material' : 'No materials found')}</option>
            {materials.map((m) => (
              <option key={m.materialId} value={m.materialId}>
                {m.materialName} {m.unit ? `(${m.unit})` : ''} - LKR {m.pricePerUnit?.toLocaleString()}/unit
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            placeholder="Enter Quantity"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        {/* Estimated Budget (read-only) */}
        <div className="form-group">
          <label>Estimated Budget (LKR)</label>
          <input type="text" value={estimatedBudget ? `LKR ${estimatedBudget.toLocaleString()}` : ''} readOnly />
        </div>

        <div className="form-buttons">
          <button type="submit" className="forward-btn">Forward to Finance Dept.</button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default Budget_approval_form;