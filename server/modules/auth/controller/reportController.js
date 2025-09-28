import AuthAuthInspectionReport from '../model/report.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import User from '../model/user.model.js';
import ProjectManagerNotificationService from '../../../services/projectManagerNotificationService.js';

// Create a new inspection report (draft)
export const createReport = async (req, res) => {
  try {
    const { inspectionRequest, inspector, propertyType, siteLocation, inspectionDate, rooms, generalNotes } = req.body;
    if (!inspectionRequest || !inspector || !propertyType || !siteLocation || !inspectionDate) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const report = new AuthAuthInspectionReport({
      inspectionRequest,
      inspector,
      propertyType,
      siteLocation,
      inspectionDate,
      rooms: rooms || [],
      generalNotes: generalNotes || '',
      status: 'draft'
    });
    await report.save();
    res.status(201).json({ message: 'Report draft created.', report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update and submit a report (including file upload)
export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { rooms, generalNotes, status } = req.body;
    const report = await AuthAuthInspectionReport.findById(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    if (rooms) report.rooms = rooms;
    if (generalNotes) report.generalNotes = generalNotes;
    if (req.file) report.reportFilePath = req.file.path;
    if (status && ['submitted', 'draft'].includes(status)) {
      report.status = status;
      if (status === 'submitted') report.submittedAt = new Date();
    }
    await report.save();
    res.status(200).json({ message: 'Report updated.', report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch reports by inspection, inspector, or status
export const getReports = async (req, res) => {
  try {
    const { inspectionRequest, inspector, status } = req.query;
    const filter = {};
    if (inspectionRequest) filter.inspectionRequest = inspectionRequest;
    if (inspector) filter.inspector = inspector;
    if (status) filter.status = status;
    const reports = await AuthAuthInspectionReport.find(filter)
      .populate('inspectionRequest')
      .populate('inspector', 'name email');
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Review, approve, or reject a report
export const reviewReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, remarks } = req.body; // action: 'approve', 'reject', 'review'
    const report = await AuthInspectionReport.findById(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    if (action === 'approve') {
      report.status = 'approved';
      report.approvedAt = new Date();
    } else if (action === 'reject') {
      report.status = 'rejected';
      report.rejectedAt = new Date();
    } else if (action === 'review') {
      report.status = 'reviewed';
      report.reviewedAt = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid action.' });
    }
    if (remarks) report.remarks = remarks;
    await report.save();

    // 🔥 NEW: Notify project managers about status change
    try {
      await ProjectManagerNotificationService.notifyReportStatusChanged(
        report._id, 
        report.status, 
        remarks || ''
      );
    } catch (notificationError) {
      console.error('Failed to notify project managers about status change:', notificationError);
    }

    res.status(200).json({ message: `Report ${action}d.`, report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== NEW FUNCTIONS FOR INSPECTOR DASHBOARD =====

// Generate a report from inspection data
export const generateReport = async (req, res) => {
  try {
    const { inspectionId, inspectorId, title, reportData } = req.body;

    // Create report record
    const report = new Report({
      inspectionId,
      inspectorId: inspectorId || req.user._id,
      generatedBy: req.user._id,
      title,
      reportData,
      status: 'completed'
    });

    await report.save();

    // Send notification to project manager
    try {
      await ProjectManagerNotificationService.notifyReportGenerated(report);
    } catch (notificationError) {
      console.error('Failed to notify project managers:', notificationError);
    }

    res.status(201).json({
      message: 'Report generated successfully',
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get reports by inspector
export const getReportsByInspector = async (req, res) => {
  try {
    const { inspectorId } = req.params;
    const reports = await AuthInspectionReport.find({ inspectorId })
      .sort({ createdAt: -1 })
      .populate('generatedBy', 'name email');

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get report PDF (simplified version)
export const getReportPDF = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await AuthInspectionReport.findById(reportId)
      .populate('generatedBy', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Generate a simple PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="report-${reportId}.pdf"`);
    
    // For now, return report data as JSON (you can implement actual PDF generation later)
    res.status(200).json({
      message: 'PDF generation would be implemented here',
      report,
      note: 'This would serve a PDF file in production'
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ message: error.message });
  }
};
