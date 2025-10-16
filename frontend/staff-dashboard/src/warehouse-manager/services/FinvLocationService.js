// src/services/FInvLocationsService.js
export const fetchInvLocation = async () => {
  try {
    const res = await fetch("/api/warehouse/inv_locations");
    if (!res.ok) throw new Error("Failed to fetch inventory locations");
    const data = await res.json();
    return data.inv_locations;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add new location
export const addInvLocation = async (locationData) => {
  try {
    const res = await fetch(`/api/warehouse/inv_locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(locationData)
    });

    const data = await res.json(); // parse response

      if (!res.ok) {
        // throw the full backend object, so frontend can access 'errors'
        throw data;
      }

      return data; // success response
    } catch (err) {
      console.error("Add location error:", err);
      throw err; // propagate to React form
    }
};

export const fetchInvLocationById = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/inv_locations/${id}`);
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
    const res = await fetch(`/api/warehouse/inv_locations/${id}`, {
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
export const deleteInvLocation = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/inv_locations/${id}`, {
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

