import {
  getAllReportsService,
  getReportByIdService,
  addReportService,
  updateReportService,
  deleteReportService
} from '../service/submitReportsService.js';

// Get all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await getAllReportsService();
    return res.status(200).json({ reports });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get single report by ID
export const getReportById = async (req, res) => {
  try {
    const report = await getReportByIdService(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    return res.status(200).json(report);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add new report
export const addReport = async (req, res) => {
  try {
    // Get uploaded file path
    const reportFileUrl = req.file ? req.file.path : null;

    const report = await addReportService(
      { reportTitle: req.body.reportTitle, reportFileUrl },
      req.userId
    );

    return res.status(201).json({ message: "Report submitted successfully", report });
  } catch (err) {
    console.error(err);
    if (err.status === 400 && err.errors) return res.status(400).json({ errors: err.errors });
    return res.status(500).json({ message: "Unable to submit report" });
  }
};

// Update report
export const updateReport = async (req, res) => {
  try {
    const reportFileUrl = req.file ? req.file.path : req.body.reportFileUrl;

    const report = await updateReportService(
      req.params.id,
      { ...req.body, reportFileUrl },
      req.userId
    );

    if (!report) return res.status(404).json({ message: "Unable to update report" });
    return res.status(200).json({ report });
  } catch (err) {
    console.error(err);
    if (err.status === 400 && err.errors) return res.status(400).json({ errors: err.errors });
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete report
export const deleteReport = async (req, res) => {
  try {
    const report = await deleteReportService(req.params.id, req.userId);
    if (!report) return res.status(404).json({ message: "Unable to delete report" });
    return res.status(200).json({ message: "Report deleted successfully", report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
