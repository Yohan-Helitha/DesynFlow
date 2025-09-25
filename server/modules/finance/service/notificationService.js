import Notification from '../model/notification.js';

export const sendNotification = async ({ userId, message, type }) => {
  const notification = new Notification({ userId, message, type });
  await notification.save();
  return notification;
};

export const getNotifications = async (userId) => {
  return Notification.find({ userId });
};
