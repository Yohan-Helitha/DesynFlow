// src/services/FInvLocationsService.js
export const fetchInvLocation = async () => {
  try {
    const res = await fetch("http://localhost:5000/inv_locations");
    if (!res.ok) throw new Error("Failed to fetch inventory locations");
    const data = await res.json();
    return data.inv_locations;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add new product
export const addInvLocation = async (locationData) => {
  try {
    const res = await fetch(`http://localhost:5000/inv_locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(locationData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to add location");
    }

    const newLocation = await res.json();
    return newLocation;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchInvLocationById = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/inv_locations/${id}`);
    if (!res.ok) throw new Error("Failed to fetch location");
    const data = await res.json();
    console.log("Fetched location:", data); // debug
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateInvLocation = async (id, data) => {
  try {
    const res = await fetch(`http://localhost:5000/inv_locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to update location');
    }

    const updatedLocation = await res.json();
    return updatedLocation;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Delete location
export const deleteInvLocation = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/inv_locations/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to delete locatipn");
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    throw err;
  }
};