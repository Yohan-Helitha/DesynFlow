// notification.route.js
import express from 'express';
import { sendNotification, getNotifications } from '../controller/notification.controller.js';

const router = express.Router();

router.post('/', sendNotification);
router.get('/', getNotifications);

export default router;
