// src/services/FrawMaterialsService.js
export const fetchRawMaterial = async () => {
  try {
    const res = await fetch("http://localhost:5000/raw_materials");
    if (!res.ok) throw new Error("Failed to fetch raw materials");
    const data = await res.json();
    return data.raw_materials;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add new product
export const addRawMaterial = async (materialData) => {
  try {
    const res = await fetch(`http://localhost:5000/raw_materials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(materialData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to add material");
    }

    const newMaterial = await res.json();
    return newMaterial;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchRawMaterialById = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/raw_materials/${id}`);
    if (!res.ok) throw new Error("Failed to fetch material");
    const data = await res.json();
    console.log("Fetched material:", data); // debug
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateRawMaterial = async (id, data) => {
  try {
    const res = await fetch(`http://localhost:5000/raw_materials/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to update material');
    }

    const updatedMaterial = await res.json();
    return updatedMaterial;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Delete product
export const deleteRawMaterial = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/raw_materials/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to delete material");
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    throw err;
  }
};