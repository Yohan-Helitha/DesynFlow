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

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to transfer request");
    }

    const newrequest = await res.json();
    return newrequest;
  } catch (err) {
    console.error(err);
    throw err;
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

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to update transfer request');
    }

    const updatedrequest = await res.json();
    return updatedrequest;
  } catch (err) {
    console.error(err);
    throw err;
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