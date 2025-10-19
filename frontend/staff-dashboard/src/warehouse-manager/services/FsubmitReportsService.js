// src/services/FsubmitReportsService.js

// Fetch all submitted reports
export const fetchReports = async () => {
  try {
    const res = await fetch("/api/warehouse/submit-reports");
    console.log("Response status:", res.status);
    if (!res.ok) throw new Error("Failed to fetch reports");
    const data = await res.json();
    console.log("Received data:", data);
    console.log("Reports array:", data.reports);
    return data.reports || [];
  } catch (err) {
    console.error("Fetch reports error:", err);
    return [];
  }
};

// Submit a new report
export const submitReport = async (reportData) => {
  try {
    const res = await fetch(`/api/warehouse/submit-reports`, {
      method: "POST",
      body: reportData // FormData with file
    });

    const data = await res.json(); // parse response

    if (!res.ok) {
      // throw the full backend object, so frontend can access 'errors'
      throw data;
    }

    return data; // success response
  } catch (err) {
    console.error("Submit report error:", err);
    throw err; // propagate to React form
  }
};

// Fetch single report by ID
export const fetchReportById = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/submit-reports/${id}`);
    if (!res.ok) throw new Error("Failed to fetch report");
    const data = await res.json();
    console.log("Fetched report:", data); // debug
    return data;
  } catch (err) {
    console.error("Fetch report by ID error:", err);
    return null;
  }
};

// Update report by ID
export const updateReport = async (id, reportData) => {
  try {
    const res = await fetch(`/api/warehouse/submit-reports/${id}`, {
      method: "PUT",
      body: reportData // FormData if updating file, otherwise JSON
    });

    const data = await res.json();

    if (!res.ok) {
      throw data; // propagate backend errors
    }

    return data;
  } catch (err) {
    console.error("Update report error:", err);
    throw err;
  }
};

// Delete report by ID
export const deleteReport = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/submit-reports/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to delete report");
    }

    return { success: true };
  } catch (err) {
    console.error("Delete report error:", err);
    throw err;
  }
};
