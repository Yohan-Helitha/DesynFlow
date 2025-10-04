import express from "express";
import { authMiddleware } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import AuthInspectionReport from '../model/report.model.js';
import {
  getReports,
  reviewReport,
  getReportsByInspector
} from '../controller/reportController.js';

const router = express.Router();

// Get all reports (for project managers)
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['project manager', 'admin']),
  getReports
);

// Get specific report by ID (for project managers)
router.get(
  '/:reportId',
  authMiddleware,
  roleMiddleware(['project manager', 'admin', 'inspector']),
  async (req, res) => {
    try {
      const { reportId } = req.params;
      const report = await AuthInspectionReport.findById(reportId)
        .populate('InspectionRequest_ID', 'client_name propertyLocation_address propertyType')
        .populate('inspector_ID', 'username email');
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      res.status(200).json({ 
        message: 'Report retrieved successfully', 
        report 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve report', error: error.message });
    }
  }
);

// Review report (for project managers)
router.patch(
  '/:reportId/review',
  authMiddleware,
  roleMiddleware(['project manager']),
  reviewReport
);

export default router;