import { getAllAuditLogService } from '../service/auditLogService.js';

// Controller function
export const getAllAuditLog = async (req, res) => {
  try {
    const audit_logs = await getAllAuditLogService();
    return res.status(200).json({ audit_logs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
