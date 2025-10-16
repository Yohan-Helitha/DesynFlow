import SubmitReports from '../model/submitReportsModel.js';
import AuditLog from '../model/auditLogModel.js';
import { validateReportUpdate } from '../validators/submitReportsValidator.js';

// Get all reports
export const getAllReportsService = async () => {
  return await SubmitReports.find();
};

// Get single report by ID
export const getReportByIdService = async (id) => {
  return await SubmitReports.findById(id);
};

export const addReportService = async (data, submittedBy) => {
  const { reportTitle, reportFileUrl } = data;

  if (!reportFileUrl) throw { status: 400, errors: { reportFileUrl: "Report file is required" } };

  const report = new SubmitReports({
    reportTitle,
    reportFileUrl,
    submittedBy: submittedBy || "WM001"
  });

  await report.save();

  // Audit log
  await AuditLog.create({
    entity: "Submit Report",
    action: "insert",
    keyInfo: JSON.stringify({ ReportID: report._id, ReportTitle: report.reportTitle }),
    createdBy: submittedBy || "WM001"
  });

  return report;
};

export const updateReportService = async (id, data, updatedBy) => {
  const report = await SubmitReports.findByIdAndUpdate(id, data, { new: true });
  if (!report) return null;

  await AuditLog.create({
    entity: "Submit Report",
    action: "update",
    keyInfo: JSON.stringify({ ReportID: report._id, ReportTitle: report.reportTitle }),
    createdBy: updatedBy || report.submittedBy
  });

  return report;
};

export const deleteReportService = async (id, deletedBy) => {
  const report = await SubmitReports.findByIdAndDelete(id);
  if (!report) return null;

  await AuditLog.create({
    entity: "Submit Report",
    action: "delete",
    keyInfo: JSON.stringify({ ReportID: report._id, ReportTitle: report.reportTitle }),
    createdBy: deletedBy || report.submittedBy
  });

  return report;
};
