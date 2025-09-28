// middlewares/sReorderRequestMiddleware.js

import { validateSReorderRequestInsert,validateSReorderRequestUpdate } from "../validators/sReorderRequestsValidator.js";

export const validateSReorderRequestInsertMW = (req, res, next) => {
  const errors = validateSReorderRequestInsert(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validateSReorderRequestUpdateMW = (req, res, next) => {
  const errors = validateSReorderRequestUpdate(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};