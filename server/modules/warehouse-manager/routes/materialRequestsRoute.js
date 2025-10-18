// src/routes/materialRequestRoutes.js
import express from "express";
const route = express.Router();

// Import controller functions
import { 
  getAllMaterialRequests,
  getMaterialRequestById,
  updateMaterialRequest,
} from "../controller/materialRequestsController.js";


// Routes
route.get("/", getAllMaterialRequests);
route.get("/:id", getMaterialRequestById);
route.put("/:id",
  updateMaterialRequest
);


// Export router
export default route;
