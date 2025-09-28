// Utility to fetch materials from the backend
export async function fetchMaterials() {
  // Prefer priced materials so unitPrice is present for UI calculations
  const res = await fetch('/api/materials/priced');
  if (!res.ok) throw new Error('Failed to fetch materials');
  return res.json();
}
