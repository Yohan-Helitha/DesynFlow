// src/routes/materialRequestRoutes.js
import express from "express";
const route = express.Router();

// Import controller functions
import { 
  getAllMaterialRequests,
  getMaterialRequestById,
  updateMaterialRequest,
} from "../controller/materialRequestsController.js";

// Import middleware for validation (if you have them)
import { 
  validateMaterialRequestUpdateMW
} from "../middleware/materialRequestsMiddleware.js";

// Routes
route.get("/", getAllMaterialRequests);
route.get("/:id", getMaterialRequestById);

route.put("/:id",
  validateMaterialRequestUpdateMW,
  updateMaterialRequest
);


// Export router
export default route;
