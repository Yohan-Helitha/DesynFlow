// middleware/stockMovementMiddleware.js
import { validateStockMovementInsert, validateStockMovementUpdate } from "../validators/stockMovementValidator.js";
import { fetchInvLocation } from "../services/FinvLocationService.js";

export const validateStockMovementMW = async (req, res, next) => {
  try {
    // Fetch all locations to check if material exists there
    const locations = await fetchInvLocation();
    const errors = validateStockMovementInsert(req.body, locations);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  } catch (err) {
    console.error("Validation middleware error:", err);
    return res.status(500).json({ message: "Validation failed", error: err.message });
  }
};

export const validateStockMovementUpdateMW = (req, res, next) => {
  const errors = validateStockMovementUpdate(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};