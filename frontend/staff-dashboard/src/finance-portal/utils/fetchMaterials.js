// Utility to fetch materials from the backend
export async function fetchMaterials(projectId) {
  // Prefer priced materials so unitPrice is present for UI calculations
  const url = projectId
    ? `/api/materials/priced?projectId=${encodeURIComponent(projectId)}`
    : '/api/materials/priced';

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch materials');
  return res.json();
}
