import express from 'express';
import {
  upsertReport,
  getReportsByProject,
  deleteReport
} from '../controller/report.controller.js';

const router = express.Router();

// Create or update a report
router.post('/', upsertReport);

// Get all reports for a project
router.get('/reports/project/:projectId', getReportsByProject);

// Delete a report
router.delete('/:id', deleteReport);

export default router;
