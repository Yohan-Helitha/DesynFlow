import express from 'express';
import { updateProjectMilestones, updateProjectTimeline } from '../controller/milestoneTimeline.controller.js';

const router = express.Router();

// Update milestones for a project
router.put('/projects/:id/milestones', updateProjectMilestones);

// Update timeline for a project
router.put('/projects/:id/timeline', updateProjectTimeline);

export default router;
