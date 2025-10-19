// src/services/FauditLogService.js
export const fetchAuditLogs = async () => {
  try {
    const res = await fetch("/api/warehouse/audit_log"); 
    if (!res.ok) throw new Error("Failed to fetch audit logs");

    const data = await res.json();
    return data.audit_logs;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const deleteAuditLog = async (id) => {
  try {
    const res = await fetch(`/api/warehouse/audit_log/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete audit log");
    return true;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

