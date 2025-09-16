import NotificationService from '../service/notification.service.js';

// Send a notification (no model changes)
export const sendNotification = async (req, res) => {
  try {
    const result = await NotificationService.sendNotification(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
