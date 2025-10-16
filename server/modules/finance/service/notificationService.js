import FinanceNotificationGeneral from '../model/notification.js';

export const sendNotification = async ({ userId, message, type }) => {
  const notification = new FinanceNotificationGeneral({ userId, message, type });
  await notification.save();
  return notification;
};

export const getNotifications = async (userId) => {
  return FinanceNotificationGeneral.find({ userId });
};
