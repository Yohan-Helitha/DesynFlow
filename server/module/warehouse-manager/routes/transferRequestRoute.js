import express from "express";
const route = express.Router();

//Insert Model
import transferRequest from "../model/transferRequestModel.js";

//Insert Controller
import { 
  getAllTransferRequest, 
  getTransferRequestById,
  addTransferRequest, 
  updateTransferRequest, 
  deleteTransferRequest 
} from "../controller/transferRequestController.js";

// import { 
//   validateTransferRequestInsertMW, validateTransferRequestUpdateMW 
// } from "../middleware/transferRequestMiddleware.js";

route.get("/",getAllTransferRequest);
route.get("/:id",getTransferRequestById);
route.post("/",
  //validateTransferRequestInsertMW, 
  addTransferRequest);
route.put("/:id",
  //validateTransferRequestUpdateMW, 
  updateTransferRequest);
route.delete("/:id",deleteTransferRequest);

//export
export default route;