// src/services/FmaterialRequestsService.js

const BASE_URL = "http://localhost:4000/api/material-requests";

/**
 * Fetch all material requests
 */
export const fetchMaterialRequests = async () => {
  try {
    console.log("Fetching material requests from:", BASE_URL);
    const res = await fetch(BASE_URL);
    console.log("Response status:", res.status);
    if (!res.ok) throw new Error("Failed to fetch material requests");
    const data = await res.json();
    console.log("Received data:", data);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Fetch material requests error:", err);
    return [];
  }
};

/**
 * Fetch material requests by project ID
 */
export const fetchRequestsByProject = async (projectId) => {
  try {
    const res = await fetch(`${BASE_URL}/project/${projectId}`);
    if (!res.ok) throw new Error(`Failed to fetch requests for project ${projectId}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Fetch requests by project error:", err);
    return [];
  }
};

/**
 * Fetch a single request by ID
 */
export const fetchRequestById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch material request");
    const data = await res.json();
    console.log("Fetched material request:", data);
    return data;
  } catch (err) {
    console.error("Fetch request by ID error:", err);
    return null;
  }
};


//Update material request
export const updateRequest = async (id, requestData) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    return data;
  } catch (err) {
    console.error("Update material request error:", err);
    throw err;
  }
};


