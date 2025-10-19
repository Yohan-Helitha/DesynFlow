// src/middlewares/transferRequestMiddleware.js
import { validateWarrantyClaimsUpdate } from "../validators/warrantyClaimsValidator.js";


export const validateWarrantyClaimsUpdateMW = (req, res, next) => {
  const errors = validateWarrantyClaimsUpdate(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};