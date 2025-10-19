// middleware/materialRequestsMiddleware.js
import {
  validateMaterialRequestUpdate
} from "../validators/materialRequestsValidator.js";

// Middleware for insert validation
export const validateMaterialRequestInsertMW = (req, res, next) => {
  const errors = {};
  if (!data.projectId) errors.projectId = "Project ID is required";
  if (!data.neededBy) errors.neededBy = "NeededBy is required";
  return errors;
};

// Middleware for update validation
export const validateMaterialRequestUpdateMW = (req, res, next) => {
  const errors = validateMaterialRequestUpdate(req.body);

  if (Object.keys(errors).length > 0) {
    console.log("Validation errors (update):", errors);
    return res.status(400).json({ errors }); // return errors as object
  }

  next();
};
