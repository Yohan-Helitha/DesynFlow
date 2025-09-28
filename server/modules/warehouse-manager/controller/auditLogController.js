import { getAllAuditLogService,deleteAuditLogService } from '../service/auditLogService.js';

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

// Delete audit log
export const deleteAuditLog = async (req, res) => {
  try {
    const audit_logs = await deleteAuditLogService(
      req.params.id,
    );

    if (!audit_logs) {
      return res.status(404).json({ message: "Unable to delete Audit Logs" });
    }

    return res.status(200).json({ audit_logs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};