import AuditLog from '../model/auditLogModel.js';

// Get all audit logs (sorted by newest first)
export const getAllAuditLogService = async () => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    console.log('Service found logs:', logs.length); // Debug log
    return logs;
  } catch (error) {
    console.error('Error in getAllAuditLogService:', error);
    throw error;
  }
};

export const deleteAuditLogService = async (id, deletedBy) => {
  const audit_logs = await AuditLog.findByIdAndDelete(id);

  if (!audit_logs) return null;

  return audit_logs;
};