// src/services/warrantyClaimService.js
export const fetchWarrantyClaims = async () => {
  try {
    const res = await fetch("/api/warehouse/warranty_claims"); 
    if (!res.ok) throw new Error("Failed to fetch warranty claims");

    const data = await res.json();
    return data.warranty_claims || data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const fetchWarrantyClaimById = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/warranty_claims/${id}`);
    if (!res.ok) throw new Error("Failed to fetch warranty claim");

    const data = await res.json();
    return data.warranty_claim || data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const createWarrantyClaim = async (warrantyClaimData) => {
  try {
    const res = await fetch("/api/warehouse/warranty_claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(warrantyClaimData),
    });
    
    if (!res.ok) throw new Error("Failed to create warranty claim");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateWarrantyClaim = async (id, warrantyClaimData) => {
  try {
    const res = await fetch(`/api/warehouse/warranty_claims/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(warrantyClaimData),
    });
    
    if (!res.ok) throw new Error("Failed to update warranty claim");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const deleteWarrantyClaim = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/warranty_claims/${id}`, { 
      method: "DELETE" 
    });
    if (!res.ok) throw new Error("Failed to delete warranty claim");
    return true;
  } catch (err) {
    console.error(err);
    throw err;
  }
};