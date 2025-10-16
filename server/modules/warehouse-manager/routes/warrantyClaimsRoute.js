import express from "express";
const route = express.Router();

//Insert Controller
import { 
  getAllWarrantyClaims, 
  getWarrantyClaimById,
  updateWarrantyClaim, 
} from "../controller/warrantyClaimsController.js";

 import { 
   validateWarrantyClaimsUpdateMW 
 } from "../middleware/warrantyClaimsMiddleware.js";

route.get("/",getAllWarrantyClaims);
route.get("/:id",getWarrantyClaimById);
route.put("/:id",
  validateWarrantyClaimsUpdateMW, 
  updateWarrantyClaim);

//export
export default route;