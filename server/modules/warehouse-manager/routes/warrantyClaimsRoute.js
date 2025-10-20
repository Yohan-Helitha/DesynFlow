import express from "express";
const route = express.Router();

//Insert Controller
import { 
  getAllWarrantyClaims, 
  getWarrantyClaimById,
  updateWarrantyClaim,
  updateShippingInfo,
} from "../controller/warrantyClaimsController.js";

 import { 
   validateWarrantyClaimsUpdateMW 
 } from "../middleware/warrantyClaimsMiddleware.js";

route.get("/",getAllWarrantyClaims);
route.get("/:id",getWarrantyClaimById);
route.put("/:id",
  validateWarrantyClaimsUpdateMW, 
  updateWarrantyClaim);
route.put("/:id/shipping", updateShippingInfo);

//export
export default route;