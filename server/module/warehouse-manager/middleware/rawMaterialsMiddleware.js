// middleware/rawMaterialsMiddleware.js
import {
  validateRawMaterialsInsert,
  validateRawMaterialsUpdate
} from "../validators/rawMaterialsValidator.js";

// Middleware for insert validation
export const validateRawMaterialsInsertMW = (req, res, next) => {
  const errors = validateRawMaterialsInsert(req.body);

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
export const validateRawMaterialsUpdateMW = (req, res, next) => {
  const errors = validateRawMaterialsUpdate(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors }); // send as object
  }

  next();
};
