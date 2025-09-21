// src/middlewares/transferRequestMiddleware.js
import { validateTransferRequestInsert,validateTransferRequestUpdate } from "../validators/transferRequestValidator.js";

export const validateTransferRequestInsertMW = (req, res, next) => {
  const errors = validateTransferRequestInsert(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validateTransferRequestUpdateMW = (req, res, next) => {
  const errors = validateTransferRequestUpdate(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};