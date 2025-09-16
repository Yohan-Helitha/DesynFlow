import express from 'express';
import { sendNotification } from '../controller/notification.controller.js';

const router = express.Router();

// Send a notification (no model changes)
router.post('/', sendNotification);

export default router;
