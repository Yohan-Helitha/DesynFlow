import express from 'express';
import * as notificationController from '../controller/notificationController.js';

const router = express.Router();

router.post('/send', notificationController.sendNotification);
router.get('/:userId', notificationController.getNotifications);

export default router;
