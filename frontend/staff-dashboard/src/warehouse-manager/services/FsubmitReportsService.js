// src/services/FsubmitReportsService.js

// const BASE_URL = "http://localhost:4000/api/warehouse/submit-reports";

// // Fetch all submitted reports
// export const fetchReports = async () => {
//   try {
//     const res = await fetch(BASE_URL);
//     if (!res.ok) throw new Error("Failed to fetch reports");
//     const data = await res.json();
//     return data.reports || [];
//   } catch (err) {
//     console.error("Fetch reports error:", err);
//     return [];
//   }
// };

// // Submit a new report
// export const submitReport = async (reportData) => {
//   try {
//     const res = await fetch(BASE_URL, {
//       method: "POST",
//       body: reportData // FormData with file
//     });

//     const data = await res.json(); // parse response

//     if (!res.ok) {
//       // throw the full backend object, so frontend can access 'errors'
//       throw data;
//     }

//     return data; // success response
//   } catch (err) {
//     console.error("Submit report error:", err);
//     throw err; // propagate to React form
//   }
// };

// // Fetch single report by ID
// export const fetchReportById = async (id) => {
//   try {
//     const res = await fetch(`${BASE_URL}/${id}`);
//     if (!res.ok) throw new Error("Failed to fetch report");
//     const data = await res.json();
//     return data;
//   } catch (err) {
//     console.error("Fetch report by ID error:", err);
//     return null;
//   }
// };

// // Update report by ID
// export const updateReport = async (id, reportData) => {
//   try {
//     const res = await fetch(`${BASE_URL}/${id}`, {
//       method: "PUT",
//       body: reportData // FormData if updating file, otherwise JSON
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw data; // propagate backend errors
//     }

//     return data;
//   } catch (err) {
//     console.error("Update report error:", err);
//     throw err;
//   }
// };

// // Delete report by ID
// export const deleteReport = async (id) => {
//   try {
//     const res = await fetch(`${BASE_URL}/${id}`, {
//       method: "DELETE"
//     });

//     if (!res.ok) {
//       const errData = await res.json();
//       throw new Error(errData.message || "Failed to delete report");
//     }

//     return { success: true };
//   } catch (err) {
//     console.error("Delete report error:", err);
//     throw err;
//   }
// };


export const fetchReports = async () => {
  try {
    const res = await fetch("http://localhost:4000/api/warehouse/submit-reports");
    if (!res.ok) throw new Error("Failed to fetch reports");
    const data = await res.json();
    return data.submit_reports;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add new product
export const submitReport = async (formData) => {
  try {
    const res = await fetch("http://localhost:4000/api/warehouse/submit-reports", {
      method: "POST",
      body: formData // send FormData directly
    });

    const data = await res.json();

    if (!res.ok) {
      // Throw backend errors for the React form to display
      throw data;
    }

    return data;
  } catch (err) {
    console.error("Add report error:", err);
    throw err;
  }
};



export const fetchReportById = async (id) => {
  try {
    const res = await fetch(`http://localhost:4000/api/warehouse/submit-reports/${id}`);
    if (!res.ok) throw new Error("Failed to fetch report");
    const data = await res.json();
    console.log("Fetched report:", data); // debug
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateReport = async (id, data) => {
  try {
    const res = await fetch(`http://localhost:4000/api/warehouse/submit-reports/${id}`, {
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
      console.error("Update report error:", err);
      throw err; // propagate to React form
    }
};

// Delete product
export const deleteReport = async (id) => {
  try {
    const res = await fetch(`http://localhost:4000/api/warehouse/submit-reports/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to delete report");
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
