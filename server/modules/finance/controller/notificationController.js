import * as notificationService from '../service/notificationService.js';

export const sendNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    const notification = await notificationService.sendNotification({ userId, message, type });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.params.userId);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
