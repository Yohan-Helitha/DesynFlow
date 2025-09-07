import express from "express";
const route = express.Router();

//Insert Model
import disposalMaterials from "../model/disposalMaterialsModel.js";

//Insert Controller
import { 
  getAllDisposalMaterials, 
  addDisposalMaterials, 
  updateDisposalMaterials, 
  deleteDisposalMaterials 
} from "../controller/disposalMaterialsController.js";

// import { 
//   validateDisposalMaterialsInsertMW, 
//   validateDisposalMaterialsUpdateMW 
// } from "../middleware/disposalMaterialsMiddleware.js";

route.get("/",getAllDisposalMaterials);
route.post("/",
  //validateDisposalMaterialsInsertMW, 
  addDisposalMaterials);
route.put("/:id",
  //validateDisposalMaterialsUpdateMW, 
  updateDisposalMaterials);
route.delete("/:id",deleteDisposalMaterials);

//export
export default route;