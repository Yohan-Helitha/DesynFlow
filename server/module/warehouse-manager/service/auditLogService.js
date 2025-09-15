import AuditLog from '../model/auditLogModel.js';

// Get all audit logs (sorted by newest first)
export const getAllAuditLogService = async () => {
  return await AuditLog.find().sort({ createdAt: -1 });
};
