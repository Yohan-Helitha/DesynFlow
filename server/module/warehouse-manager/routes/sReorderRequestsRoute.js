import express from "express";
const route = express.Router();

//Insert Model
import sReorderRequests from "../model/sReorderRequestsModel.js";

//Insert Controller
import { 
  getAllsReorderRequests, 
  addsReorderRequests, 
  updatesReorderRequests, 
  deletesReorderRequests 
} from "../controller/sReorderRequestsController.js";

// import { 
//   validateSReorderRequestsInsertMW, validateSReorderRequestsUpdateMW 
// } from "../middleware/sReorderRequestsMiddleware.js";

route.get("/",getAllsReorderRequests);
route.post("/",
  //validateSReorderRequestsInsertMW, 
  addsReorderRequests);
route.put("/:id",
  //validateSReorderRequestsUpdateMW, 
  updatesReorderRequests);
route.delete("/:id",deletesReorderRequests);

//export
export default route;