import express from 'express';
import {
  getProjectProgress,
  getTeamWorkload,
  getAvgTaskCompletionTime
} from '../controller/kpi.controller.js';

const router = express.Router();

// Project progress KPIs
router.get('/kpi/project/:id/progress', getProjectProgress);

// Team workload KPIs
router.get('/kpi/team/:id/workload', getTeamWorkload);

// Average task completion time
router.get('/kpi/project/:projectId/avg-completion-time', getAvgTaskCompletionTime);

export default router;
