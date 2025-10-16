import { Router } from 'express';
import {
  assignInspector,
  listAssignments,
  getInspectorAssignments,
  updateAssignmentStatus,
  deleteAssignment,
  getAvailableInspectorsWithDistances
} from '../controller/assignmentController.js';

const router = Router();

// Route: Assign an inspector to an inspection request
router.post('/assign', assignInspector);

// Route: Get available inspectors with distances from property (for CSR selection)
router.get('/available-inspectors/:inspectionRequestId', getAvailableInspectorsWithDistances);

// Route: List all assignments (optionally filter by status or inspector)
router.get('/list', listAssignments);

// Route: Get assignments for a specific inspector
router.get('/inspector/:inspectorId', getInspectorAssignments);

// Route: Update assignment status (completed, canceled, etc.)
router.patch('/status/:assignmentId', updateAssignmentStatus);

// Route: Delete assignment
router.delete('/:assignmentId', deleteAssignment);

export default router;