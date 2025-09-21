// middleware/invLocationMiddleware.js
import { validateInvLocationsInsert, validateInvLocationsUpdate } from "../validators/invLocationsValidator.js";

// Middleware for insert validation
export const validateInvLocationsInsertMW = (req, res, next) => {
  const errors = validateInvLocationsInsert(req.body);

  if (Object.keys(errors).length > 0) {
    console.log("Validation Errors:", errors);
    return res.status(400).json({ errors }); // send as object
  }

  next();
};

// Middleware for update validation
export const validateInvLocationsUpdateMW = (req, res, next) => {
  const errors = validateInvLocationsUpdate(req.body);

  if (Object.keys(errors).length > 0) {
    console.log("Validation Errors:", errors);
    return res.status(400).json({ errors }); // send as object
  }

  next();
};
