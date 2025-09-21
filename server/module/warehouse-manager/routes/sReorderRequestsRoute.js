import express from "express";
const route = express.Router();

//Insert Controller
import { 
  getAllsReorderRequests, 
  getSReorderRequestById,
  addsReorderRequests, 
  updatesReorderRequests, 
  deletesReorderRequests 
} from "../controller/sReorderRequestsController.js";

 import { 
   validateSReorderRequestInsertMW, validateSReorderRequestUpdateMW 
 } from "../middleware/sReorderRequestsMiddleware.js";

route.get("/",getAllsReorderRequests);
route.get("/:id",getSReorderRequestById);
route.post("/",
  validateSReorderRequestInsertMW, 
  addsReorderRequests);
route.put("/:id",
  validateSReorderRequestUpdateMW, 
  updatesReorderRequests);
route.delete("/:id",deletesReorderRequests);

//export
export default route;