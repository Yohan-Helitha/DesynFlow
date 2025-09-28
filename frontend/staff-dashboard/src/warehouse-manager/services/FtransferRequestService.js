// src/services/FtransferRequestService.js
export const fetchTransferRequests = async () => {
  try {
    const res = await fetch("http://localhost:5000/transfer_request");
    if (!res.ok) throw new Error("Failed to fetch transfer requests");
    const data = await res.json();
    return data.transfer_request;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add new product
export const addTransferRequest = async (requestData) => {
  try {
    const res = await fetch(`http://localhost:5000/transfer_request`, {
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
      console.error("Add location error:", err);
      throw err; // propagate to React form
    }
};

export const fetchTransferRequestById = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/transfer_request/${id}`);
    if (!res.ok) throw new Error("Failed to fetch stock request");
    const data = await res.json();
    console.log("Fetched request:", data); // debug
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateTransferRequest = async (id, data) => {
  try {
    const res = await fetch(`http://localhost:5000/transfer_request/${id}`, {
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
      console.error("Add location error:", err);
      throw err; // propagate to React form
    }
};

// Delete product
export const deleteTransferRequest = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/transfer_request/${id}`, {
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