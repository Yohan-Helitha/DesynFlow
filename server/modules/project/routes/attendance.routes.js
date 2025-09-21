import express from 'express';
import {
  getAttendanceForTeam,
  upsertAttendance,
  deleteAttendance
} from '../controller/attendance.controller.js';

const router = express.Router();

// Get attendance for a team (weekly/monthly)
router.get('/team/:teamId', getAttendanceForTeam);

// Create or update attendance for a member
router.post('/', upsertAttendance);

// Delete attendance record
router.delete('/:id', deleteAttendance);

export default router;
