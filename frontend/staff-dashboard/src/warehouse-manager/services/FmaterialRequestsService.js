// Fetch all material requests
export const fetchMaterialRequests = async () => {
  try {
    const res = await fetch("/api/warehouse/material-requests");
    if (!res.ok) throw new Error("Failed to fetch material requests");
    const data = await res.json();
    return data.materialRequests || []; // match backend response key
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Fetch a single material request by ID
export const fetchMaterialRequestById = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/material-requests/${id}`);
    if (!res.ok) throw new Error("Failed to fetch material request");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateMaterialRequest = async (id, updatedFields) => {
  try {
    const res = await fetch(`/api/warehouse/material-requests/${id}`, {
      method: "PUT", // PATCH for partial updates
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error("Failed to update material request");
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};


