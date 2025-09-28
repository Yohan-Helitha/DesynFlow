import express from 'express';
import { completeProject, archiveProject } from '../controller/completeArchive.controller.js';

const router = express.Router();

// Mark project as completed
router.put('/projects/:id/complete', completeProject);

// Archive project
router.put('/projects/:id/archive', archiveProject);

export default router;
