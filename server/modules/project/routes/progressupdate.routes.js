import express from 'express';
import {
  getFlaggedIssues,
  getProgressUpdatesByProject,
  resolveIssue
} from '../controller/progressupdate.controller.js';

const router = express.Router();

// Get flagged issues for reports
router.get('/flagged-issues', getFlaggedIssues);

// Get progress updates by project
router.get('/progress-updates/project/:projectId', getProgressUpdatesByProject);

// Resolve a flagged issue
router.patch('/progress-updates/:progressUpdateId/issues/:issueId/resolve', resolveIssue);

export default router;