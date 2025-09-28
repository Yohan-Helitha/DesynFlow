// src/services/FsReorderRequestService.js
export const fetchSReorderRequests = async () => {
  try {
    const res = await fetch("http://localhost:5000/s_reorder_requests");
    if (!res.ok) throw new Error("Failed to fetch stock reorder requests");
    const data = await res.json();
    return data.s_reorder_requests;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add new product
export const addSReorderRequest = async (requestData) => {
  try {
    const res = await fetch(`http://localhost:5000/s_reorder_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
    });

    const data = await res.json(); // parse response

      if (!res.ok) {
        // throw the full backend object, so frontend can access 'errors'
        throw data;
      }

      return data; // success response
    } catch (err) {
      console.error("Add request error:", err);
      throw err; // propagate to React form
    }
};

export const fetchSReorderRequestById = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/s_reorder_requests/${id}`);
    if (!res.ok) throw new Error("Failed to fetch stock reorder request");
    const data = await res.json();
    console.log("Fetched request:", data); // debug
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateSReorderRequest = async (id, data) => {
  try {
    const res = await fetch(`http://localhost:5000/s_reorder_requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const request = await res.json(); // parse response

      if (!res.ok) {
        // throw the full backend object, so frontend can access 'errors'
        throw request;
      }

      return request; // success response
    } catch (err) {
      console.error("Add request error:", err);
      throw err; // propagate to React form
    }
};

// Delete product
export const deleteSReorderRequest = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/s_reorder_requests/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to delete request");
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    throw err;
  }
};