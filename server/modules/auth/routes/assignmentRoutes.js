import { Router } from 'express';
import {
  assignInspector,
  listAssignments,
  updateAssignmentStatus,
  deleteAssignment
} from '../controller/assignmentController.js';

const router = Router();

// Route: Assign an inspector to an inspection request
router.post('/assign', assignInspector);

// Route: List all assignments (optionally filter by status or inspector)
router.get('/list', listAssignments);

// Route: Update assignment status (completed, canceled, etc.)
router.patch('/status/:assignmentId', updateAssignmentStatus);

// Route: Delete assignment
router.delete('/:assignmentId', deleteAssignment);

export default router;