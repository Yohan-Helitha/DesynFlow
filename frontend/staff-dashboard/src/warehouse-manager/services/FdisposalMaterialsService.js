// src/services/FdisposalMaterialsService.js
export const fetchDisposalMaterials = async () => {
  try {
    const res = await fetch("http://localhost:5000/disposal_materials");
    if (!res.ok) throw new Error("Failed to fetch disposal materials");
    const data = await res.json();
    return data.disposal_materials;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add material
export const addDisposalMaterial = async (disposalMaterialData) => {
  try {
    const res = await fetch(`http://localhost:5000/disposal_materials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(disposalMaterialData)
    });

    const data = await res.json(); // parse response

      if (!res.ok) {
        // throw the full backend object, so frontend can access 'errors'
        throw data;
      }

      return data; // success response
    } catch (err) {
      console.error("Add product error:", err);
      throw err; // propagate to React form
    }
};

export const fetchDisposalMaterialsById = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/disposal_materials/${id}`);
    
    if (!res.ok) throw new Error("Failed to fetch material");
    const data = await res.json();
    console.log("Fetched location:", data); // debug
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const fetchDisposalRecordById = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/disposal_materials/record/${id}`);
    
    if (!res.ok) throw new Error("Failed to fetch material");
    const data = await res.json();
    console.log("Fetched location:", data); // debug
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};


export const updateDisposalMaterial = async (id, data) => {
  try {
    const res = await fetch(`http://localhost:5000/disposal_materials/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await res.json(); // parse response

      if (!res.ok) {
        // throw the full backend object, so frontend can access 'errors'
        throw result;
      }

      return result; // success response
    } catch (err) {
      console.error("Update product error:", err);
      throw err; // propagate to React form
    }
};

// Delete location
export const deleteDisposalMaterial = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/disposal_materials/${id}`, {
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