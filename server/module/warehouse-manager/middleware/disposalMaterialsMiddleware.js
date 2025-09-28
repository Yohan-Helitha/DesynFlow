// middleware/disposalMaterialsMiddleware.js
import {
  validateDisposalMaterialInsert,
  validateDisposalMaterialUpdate,
} from "../validators/disposalMaterialsValidator.js";

// Middleware for insert validation
export const validateDisposalMaterialsInsertMW = (req, res, next) => {
  const errors = validateDisposalMaterialInsert(req.body);

  if (Object.keys(errors).length > 0) {
    console.log("Validation Errors:", errors);
    return res.status(400).json({ errors });
  }

  next();
};

// Middleware for update validation
export const validateDisposalMaterialsUpdateMW = (req, res, next) => {
  const errors = validateDisposalMaterialUpdate(req.body);

  if (Object.keys(errors).length > 0) {
    console.log("Validation Errors:", errors);
    return res.status(400).json({ errors });
  }

  next();
};
