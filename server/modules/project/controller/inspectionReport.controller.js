// Project Manager Controller for Inspector Reports
// This controller safely imports from auth module without modifying it

import AuthInspectionReport from '../../auth/model/report.model.js';
import { authMiddleware } from '../../auth/middleware/authMiddleware.js';

// Get all submitted inspection reports for Project Manager dashboard
export const getAllSubmittedInspectionReports = async (req, res) => {
  try {
    // Get all completed/submitted inspection reports
    const reports = await AuthInspectionReport.find({ 
      status: { $in: ['completed', 'submitted'] } 
    })
      .populate('inspectorId', 'username email name')
      .populate('generatedBy', 'username email name')
      .sort({ submittedAt: -1, createdAt: -1 });
    
    // Transform data to match the expected format for the frontend
    const transformedReports = reports.map(report => ({
      _id: report._id,
      title: report.title || 'Inspection Report',
      date: report.reportData?.inspectionDate 
        ? new Date(report.reportData.inspectionDate).toLocaleDateString('en-CA') // YYYY-MM-DD format
        : new Date(report.submittedAt || report.createdAt).toLocaleDateString('en-CA'),
      location: report.reportData?.propertyAddress || 'N/A',
      client: report.reportData?.clientName || 'Unknown Client',
      inspector: report.inspectorId?.username || report.inspectorId?.name || 'Unknown Inspector',
      submittedDate: report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'N/A',
      status: report.status,
      fileUrl: report.pdfPath || null,
      type: 'submitted' // To distinguish from static reports
    }));
    
    res.status(200).json(transformedReports);
  } catch (error) {
    console.error('Error fetching submitted inspection reports:', error);
    res.status(500).json({ 
      message: 'Failed to fetch submitted inspection reports', 
      error: error.message 
    });
  }
};