// src/services/FthresholdAlertService.js
export const fetchThresholdAlerts = async () => {
  try {
    const res = await fetch("/api/warehouse/threshold_alert"); 
    if (!res.ok) throw new Error("Failed to fetch threshold alerts");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const deleteThresholdAlert = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/threshold_alert/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete threshold alert");
    return true;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

