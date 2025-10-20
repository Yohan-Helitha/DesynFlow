export const validateCreateNotificationMW = (req, res, next) => {
  const { type, title } = req.body;
  if (!type || !title) return res.status(400).json({ message: "type and title are required" });
  next();
};
