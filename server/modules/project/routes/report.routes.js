import express from 'express';
import {
  generatePDFReport,
  upsertReport,
  getReportsByProject,
  deleteReport
} from '../controller/report.controller.js';

const router = express.Router();

// Generate PDF report
router.post('/generate', generatePDFReport);

// Create or update a report
router.post('/', upsertReport);

// Get all reports for a project
router.get('/project/:projectId', getReportsByProject);

// Delete a report
router.delete('/:id', deleteReport);

export default router;
