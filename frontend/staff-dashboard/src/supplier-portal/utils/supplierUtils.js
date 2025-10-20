import axios from 'axios';

// Fetch the supplier object for the currently authenticated user.
// The backend should infer the supplier from the auth token/session.
export async function fetchCurrentSupplier() {
  const res = await axios.get('/api/suppliers/me');
  return res.data;
}

// Normalize status strings for consistent comparisons across the UI.
export function normalizeStatus(status) {
  if (!status && status !== 0) return '';
  return String(status).toLowerCase().trim();
}

// Resolve a material name from either an item entry or a material object.
// Handles cases where materialId may be a populated object or a plain id.
export function getMaterialName(itemOrMaterial) {
  if (!itemOrMaterial) return 'Unknown Material';
  // If passed an item which contains materialId
  if (itemOrMaterial.materialId) {
    const m = itemOrMaterial.materialId;
    return m?.materialName || m?.name || String(m) || 'Unknown Material';
  }
  // If passed a material object
  return itemOrMaterial?.materialName || itemOrMaterial?.name || String(itemOrMaterial) || 'Unknown Material';
}

export default {
  fetchCurrentSupplier,
  normalizeStatus,
  getMaterialName
};
