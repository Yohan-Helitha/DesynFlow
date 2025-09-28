import express from 'express';
import {
    createMeeting,
    getMeetingsByProject,
    getMeetingById,
    updateMeeting,
    deleteMeeting
} from '../controller/meeting.controller.js';

const router = express.Router();

// Create a new meeting
router.post('/meetings', createMeeting);

// Get all meetings for a project
router.get('/meetings/project/:projectId', getMeetingsByProject);

// Get a single meeting by ID
router.get('/meetings/:id', getMeetingById);

// Update a meeting
router.put('/meetings/:id', updateMeeting);

// Delete a meeting
router.delete('/meetings/:id', deleteMeeting);

export default router;