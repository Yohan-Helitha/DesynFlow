// middleware/manuProductsMiddleware.js
import {
  validateManuProductInsert,
  validateManuProductUpdate
} from "../validators/manuProductsValidator.js";

// Middleware for insert validation
export const validateManuProductInsertMW = (req, res, next) => {
  const errors = validateManuProductInsert(req.body);

  if (Object.keys(errors).length > 0) {
    console.log("Errors:", errors);
    return res.status(400).json({ errors }); // send as object
  }

  // Auto-fill currentLevel if not provided
  if (!req.body.currentLevel) {
    req.body.currentLevel = req.body.restockLevel;
  }

  next();
};

// Middleware for update validation
export const validateManuProductUpdateMW = (req, res, next) => {
  const errors = validateManuProductUpdate(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors }); // send as object
  }

  next();
};
