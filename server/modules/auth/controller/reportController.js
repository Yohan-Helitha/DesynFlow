import Report from '../model/report.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import User from '../model/user.model.js';

// Create a new inspection report (draft)
export const createReport = async (req, res) => {
  try {
    const { inspectionRequest, inspector, propertyType, siteLocation, inspectionDate, rooms, generalNotes } = req.body;
    if (!inspectionRequest || !inspector || !propertyType || !siteLocation || !inspectionDate) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const report = new Report({
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
    const report = await Report.findById(reportId);
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
    const reports = await Report.find(filter)
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
    const report = await Report.findById(reportId);
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
    res.status(200).json({ message: `Report ${action}d.`, report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};