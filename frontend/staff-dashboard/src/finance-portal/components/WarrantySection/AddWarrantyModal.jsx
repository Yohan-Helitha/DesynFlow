import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export const AddWarrantyModal = ({ onClose, onCreated }) => {
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Track items already under warranty for the selected project
  const [blockedItemIds, setBlockedItemIds] = useState(new Set());
  const [warrantiesLoading, setWarrantiesLoading] = useState(false);

  const [formData, setFormData] = useState({
    projectId: '',
    clientId: '', // auto from selected project
    itemId: '', // material _id
    startDate: '',
    endDate: '',
  });

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('authToken')
      : null;

  // Some endpoints return supplier-material entries where the actual Material document is nested at `materialId`.
  const getCoreMaterial = (m) => {
    if (!m) return m;
    if (
      m.materialId &&
      typeof m.materialId === 'object' &&
      (m.materialId.materialName || m.materialId.category || m.materialId.type)
    ) {
      return m.materialId;
    }
    return m;
  };

  // Helper: safe material label (prefer human-readable)
  const getMaterialLabel = (m) => {
    const core = getCoreMaterial(m);
    if (!core) return 'Unnamed Material';
    const name = typeof core.materialName === 'string' ? core.materialName.trim() : '';
    const altName = typeof core.name === 'string' ? core.name.trim() : '';
    const cat = typeof core.category === 'string' ? core.category.trim() : '';
    const typ = typeof core.type === 'string' ? core.type.trim() : '';
    const catType = [cat, typ].filter(Boolean).join(' - ');
    const matId = typeof core.materialId === 'string' ? core.materialId.trim() : '';
    if (name) return name;
    if (altName) return altName;
    if (catType) return catType;
    if (matId) return matId;
    return String(core._id || 'Unnamed Material');
  };

  // Helpers
  const toDateInput = (d) => {
    if (!d) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const addMonths = (date, months) => {
    console.log('addMonths called with date:', date, 'months:', months);
    const d = new Date(date);
    console.log('Initial date object:', d);
    const targetMonth = d.getMonth() + months;
    console.log('Target month index:', targetMonth);
    d.setMonth(targetMonth);
    console.log('After setMonth:', d);
    // handle month overflow (e.g., Jan 31 + 1 month → Mar 3); set to last day of previous month
    if (d.getMonth() !== (targetMonth % 12 + 12) % 12) {
      d.setDate(0);
      console.log('Month overflow corrected:', d);
    }
    console.log('Final date:', d);
    return d;
  };
  const getWarrantyMonths = (m) => {
    const core = getCoreMaterial(m);
    if (!core) return 12;
    
    // Check for numeric fields first
    if (typeof core.warrantyPeriodMonths === 'number' && core.warrantyPeriodMonths > 0) {
      console.log('Found warrantyPeriodMonths:', core.warrantyPeriodMonths);
      return core.warrantyPeriodMonths;
    }
    if (typeof core.warrantyMonths === 'number' && core.warrantyMonths > 0) {
      console.log('Found warrantyMonths:', core.warrantyMonths);
      return core.warrantyMonths;
    }
    if (core.warranty && typeof core.warranty.periodMonths === 'number' && core.warranty.periodMonths > 0) {
      console.log('Found warranty.periodMonths:', core.warranty.periodMonths);
      return core.warranty.periodMonths;
    }
    if (core.warranty && typeof core.warranty.months === 'number' && core.warranty.months > 0) {
      console.log('Found warranty.months:', core.warranty.months);
      return core.warranty.months;
    }
    if (typeof core.warrantyPeriod === 'number' && core.warrantyPeriod > 0) {
      console.log('Found warrantyPeriod (number):', core.warrantyPeriod);
      return core.warrantyPeriod;
    }
    if (typeof core.warrantyPeriodDays === 'number' && core.warrantyPeriodDays > 0) {
      console.log('Found warrantyPeriodDays:', core.warrantyPeriodDays);
      return Math.ceil(core.warrantyPeriodDays / 30);
    }
    
    // Try parsing string warrantyPeriod like "12 months", "1 year", "365 days", or just "12"
    if (typeof core.warrantyPeriod === 'string') {
      const s = core.warrantyPeriod.trim().toLowerCase();
      console.log('Parsing warrantyPeriod string:', s);
      
      // Extract numeric value
      const numMatch = s.match(/\d+(?:\.\d+)?/);
      if (numMatch) {
        const num = parseFloat(numMatch[0]);
        console.log('Extracted number:', num);
        
        if (s.includes('year')) {
          console.log('Contains "year", converting to months:', num * 12);
          return Math.round(num * 12);
        }
        if (s.includes('month')) {
          console.log('Contains "month", using as is:', num);
          return Math.round(num);
        }
        if (s.includes('day')) {
          console.log('Contains "day", converting to months:', num / 30);
          return Math.ceil(num / 30);
        }
        
        // If just a number with no unit, assume months
        if (!isNaN(num) && num > 0) {
          console.log('No unit found, assuming months:', num);
          return Math.round(num);
        }
      }
    }
    
    console.log('No warranty period found, defaulting to 12 months');
    return 12;
  };

  // Fetch projects and materials
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [projRes, matRes] = await Promise.all([
          axios.get('http://localhost:3000/api/projects', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3000/api/materials', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!mounted) return;
        setProjects(Array.isArray(projRes.data) ? projRes.data : []);
        setMaterials(Array.isArray(matRes.data) ? matRes.data : []);
        // initialize start date
        const todayStr = toDateInput(new Date());
        setFormData((prev) => ({ ...prev, startDate: todayStr }));
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.error || e?.message || 'Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Build normalized list of materials (unique core Material ids)
  const normalizedMaterials = useMemo(() => {
    const map = new Map();
    for (const m of materials) {
      const core = getCoreMaterial(m);
      if (!core) continue;
      const id = String(core._id || core.id || core.materialId || '');
      if (!id) continue;
      if (!map.has(id)) {
        map.set(id, {
          id,
          label: getMaterialLabel(core),
          months: getWarrantyMonths(core),
          doc: core,
        });
      }
    }
    return Array.from(map.values());
  }, [materials]);

  // When project changes, auto set clientId and fetch warranties for that project
  const onProjectChange = async (projectId) => {
    const proj = projects.find((p) => String(p._id) === String(projectId));
    const clientId = proj?.clientId || proj?.ownerId || '';
    setFormData((prev) => ({ ...prev, projectId, clientId, itemId: '' }));

    if (!projectId) {
      setBlockedItemIds(new Set());
      return;
    }
    try {
      setWarrantiesLoading(true);
      const res = await axios.get('http://localhost:3000/api/warranties', {
        params: { projectId },
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(res.data) ? res.data.slice() : [];
      if (list.some((it) => it && (it.createdAt || it.createdDate))) {
        list.sort((a, b) => new Date(b.createdAt || b.createdDate || 0) - new Date(a.createdAt || a.createdDate || 0));
      }
      const ids = new Set(
        list
          .map((w) => {
            const it = w.itemId;
            if (!it) return null;
            if (typeof it === 'string') return it;
            if (typeof it === 'object') return it._id || it.id || null;
            return null;
          })
          .filter(Boolean)
          .map(String)
      );
      setBlockedItemIds(ids);
    } catch (e) {
      // If filtering by projectId is unsupported, fallback to clearing so we don't block all
      setBlockedItemIds(new Set());
    } finally {
      setWarrantiesLoading(false);
    }
  };

  // When material changes, calculate endDate from startDate + warranty months
  const onMaterialChange = (itemId) => {
    console.log('=== onMaterialChange called ===');
    console.log('Selected itemId:', itemId);
    
    // Find from normalizedMaterials (which has the correct core material)
    const normalizedMat = normalizedMaterials.find((n) => String(n.id) === String(itemId));
    console.log('Found normalized material:', normalizedMat);
    
    if (!normalizedMat) {
      console.error('Material not found in normalizedMaterials');
      setFormData((prev) => ({ ...prev, itemId }));
      return;
    }
    
    const months = normalizedMat.months; // Already calculated in normalizedMaterials
    console.log('Warranty months from normalized material:', months);
    
    const start = formData.startDate ? new Date(formData.startDate) : new Date();
    console.log('Start date:', start);
    const end = addMonths(start, months);
    console.log('End date (after adding months):', end);
    console.log('End date formatted:', toDateInput(end));
    setFormData((prev) => ({ ...prev, itemId, endDate: toDateInput(end) }));
  };

  // If start date changes (we keep it auto today, but in case), recompute endDate
  useEffect(() => {
    if (!formData.itemId || !formData.startDate) return;
    console.log('=== useEffect recalculating endDate ===');
    console.log('formData.itemId:', formData.itemId);
    console.log('formData.startDate:', formData.startDate);
    
    // Find from normalizedMaterials
    const normalizedMat = normalizedMaterials.find((n) => String(n.id) === String(formData.itemId));
    console.log('Found normalized material in useEffect:', normalizedMat);
    
    if (!normalizedMat) {
      console.error('Material not found in useEffect');
      return;
    }
    
    const months = normalizedMat.months;
    console.log('Using warranty months:', months);
    const end = addMonths(new Date(formData.startDate), months);
    console.log('Calculated end date:', toDateInput(end));
    setFormData((prev) => ({ ...prev, endDate: toDateInput(end) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.itemId, normalizedMaterials]);

  // Derive available materials based on blockedItemIds and selected project
  const availableMaterials = useMemo(() => {
    const blocked = new Set(Array.from(blockedItemIds).map(String));
    if (!formData.projectId) return normalizedMaterials; // require project to apply filter
    return normalizedMaterials.filter((m) => !blocked.has(String(m.id)));
  }, [normalizedMaterials, blockedItemIds, formData.projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!formData.projectId) {
        setError('Please select a project.');
        return;
      }
      if (blockedItemIds.has(String(formData.itemId))) {
        setError('Selected material already has a warranty for this project.');
        return;
      }
      if (
        !formData.clientId ||
        !formData.itemId ||
        !formData.startDate ||
        !formData.endDate
      ) {
        setError('Please select material; dates will be calculated.');
        return;
      }
      // Backend expects duration (in months), not endDate/status
      const mat = materials.find((m) => String(m._id) === String(formData.itemId));
      const duration = getWarrantyMonths(mat) || 12;
      const payload = {
        projectId: formData.projectId,
        clientId: formData.clientId,
        itemId: formData.itemId,
        startDate: formData.startDate,
        duration,
      };
      const res = await axios.post(
        'http://localhost:3000/api/warranties',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCreated?.(res.data);
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to create warranty');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396] bg-[#F7EED3]">
          <h3 className="text-lg font-medium text-[#674636]">Add New Warranty</h3>
          <button onClick={onClose} className="text-[#AAB396] hover:text-[#674636]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Project & Item selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-[#AAB396] mb-4">Project</h4>
                <label className="block text-sm font-medium text-[#674636] mb-1">
                  Project *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => onProjectChange(e.target.value)}
                  className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                  required
                >
                  <option value="" disabled>
                    Select a project
                  </option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName || p.name || p._id}
                    </option>
                  ))}
                </select>
                {/* Auto clientId (hidden from user) */}
                {formData.clientId && (
                  <p className="mt-2 text-xs text-[#674636]">
                    Client will be set automatically.
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#AAB396] mb-4">
                  Item (Material)
                </h4>
                <label className="block text-sm font-medium text-[#674636] mb-1">
                  Material *
                </label>
                <select
                  value={formData.itemId}
                  onChange={(e) => onMaterialChange(e.target.value)}
                  className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
                  required
                  disabled={!formData.projectId || warrantiesLoading}
                >
                  <option value="" disabled>
                    {!formData.projectId
                      ? 'Select a project first'
                      : warrantiesLoading
                      ? 'Loading materials...'
                      : availableMaterials.length
                      ? 'Select a material'
                      : 'No available materials (all already warrantied)'}
                  </option>
                  {availableMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                {formData.itemId && (
                  <MaterialWarrantyHint
                    material={normalizedMaterials.find((n) => String(n.id) === String(formData.itemId))?.doc}
                  />
                )}
              </div>
            </div>

            {/* Dates (calculated) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-[#AAB396] mb-4">
                  Warranty Period
                </h4>
                <label className="block text-sm font-medium text-[#674636] mb-1">
                  Start Date (calculated)
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  disabled
                  className="w-full border border-[#AAB396] rounded-md px-3 py-2 bg-[#F7EED3]"
                />
              </div>
              <div>
                <h4 className="invisible mb-4">.</h4>
                <label className="block text-sm font-medium text-[#674636] mb-1">
                  End Date (calculated)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  disabled
                  className="w-full border border-[#AAB396] rounded-md px-3 py-2 bg-[#F7EED3]"
                />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#F7EED3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#674636] border border-transparent rounded-md text-sm font-medium text-[#FFF8E8] hover:bg-[#AAB396] disabled:opacity-50"
              >
                Create Warranty
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

function MaterialWarrantyHint({ material }) {
  const months = useMemo(() => {
    if (!material) return null;
    
    // Check numeric fields
    if (typeof material.warrantyPeriodMonths === 'number' && material.warrantyPeriodMonths > 0) 
      return material.warrantyPeriodMonths;
    if (typeof material.warrantyMonths === 'number' && material.warrantyMonths > 0) 
      return material.warrantyMonths;
    if (material.warranty && typeof material.warranty.periodMonths === 'number' && material.warranty.periodMonths > 0) 
      return material.warranty.periodMonths;
    if (material.warranty && typeof material.warranty.months === 'number' && material.warranty.months > 0) 
      return material.warranty.months;
    if (typeof material.warrantyPeriod === 'number' && material.warrantyPeriod > 0) 
      return material.warrantyPeriod;
    if (typeof material.warrantyPeriodDays === 'number' && material.warrantyPeriodDays > 0) 
      return Math.ceil(material.warrantyPeriodDays / 30);
    
    // Parse string
    if (typeof material.warrantyPeriod === 'string') {
      const s = material.warrantyPeriod.trim().toLowerCase();
      const numMatch = s.match(/\d+(?:\.\d+)?/);
      if (numMatch) {
        const num = parseFloat(numMatch[0]);
        if (s.includes('year')) return Math.round(num * 12);
        if (s.includes('month')) return Math.round(num);
        if (s.includes('day')) return Math.ceil(num / 30);
        // Just a number, assume months
        if (!isNaN(num) && num > 0) return Math.round(num);
      }
    }
    return null;
  }, [material]);

  if (months == null) return null;
  return (
    <p className="mt-2 text-xs text-[#674636]">
      This material includes approximately {months} month(s) of warranty.
    </p>
  );
}
