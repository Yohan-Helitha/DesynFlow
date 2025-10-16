import express from 'express';
import { sendNotification, getNotifications } from '../controller/notification.controller.js';

const router = express.Router();

// Get all notifications
router.get('/', getNotifications);

// Send a notification (no model changes)
router.post('/', sendNotification);

export default router;
