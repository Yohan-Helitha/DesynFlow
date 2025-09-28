import express from "express";
const route = express.Router();

//Insert Model
import invLocations from "../model/invLocationsModel.js";

//Insert Controller
import { 
  getAllInvLocations, 
  getInvLocationById,
  addInvLocations, 
  updateInvLocations, 
  deleteInvLocations 
} from "../controller/invLocationsController.js";

 import { 
   validateInvLocationsInsertMW, validateInvLocationsUpdateMW 
 } from "../middleware/invLocationsMiddleware.js";

route.get("/",getAllInvLocations);
route.get("/:id", getInvLocationById); 
route.post("/",
  validateInvLocationsInsertMW, 
  addInvLocations);
route.put("/:id",
  validateInvLocationsUpdateMW, 
  updateInvLocations);
route.delete("/:id",deleteInvLocations);

//export
export default route;