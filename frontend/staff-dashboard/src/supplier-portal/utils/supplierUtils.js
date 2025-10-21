import axios from 'axios';

// Fetch the supplier object for the currently authenticated user.
// The backend should infer the supplier from the auth token/session.
export async function fetchCurrentSupplier() {
  try {
    // Get user from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('authToken');
    
    console.log('fetchCurrentSupplier - userData from localStorage:', userData);
    console.log('fetchCurrentSupplier - authToken present:', !!authToken);
    
    if (!userData.id && !userData.email) {
      console.error('No user data found in localStorage:', userData);
      throw new Error('No authenticated user found');
    }
    
    if (!authToken) {
      console.error('No auth token found in localStorage');
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    // Send both auth token and user data in headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };
    
    if (userData.email) {
      headers['x-user-data'] = JSON.stringify(userData);
    }
    
    console.log('Making request to /api/suppliers/me with headers:', { ...headers, Authorization: '***' });
    
    const res = await axios.get('/api/suppliers/me', { headers });
    console.log('fetchCurrentSupplier - response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching current supplier:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error;
  }
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
