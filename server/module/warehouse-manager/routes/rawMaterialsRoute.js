import express from "express";
const route = express.Router();

//Insert Model
import rawMaterials from "../model/rawMaterialsModel.js";

//Insert Controller
import { 
  getAllRawMaterials, 
  getRawMaterialById,
  addRawMaterials, 
  updateRawMaterials, 
  deleteRawMaterials 
} from "../controller/rawMaterialsController.js";

// import { 
//   validateRawMaterialsInsertMW, 
//   validateRawMaterialsUpdateMW 
// } from "../middleware/rawMaterialsMiddleware.js";

route.get("/",getAllRawMaterials);
route.get("/:id", getRawMaterialById); 
route.post("/",
  //validateRawMaterialsInsertMW, 
  addRawMaterials);
route.put("/:id",
  //validateRawMaterialsUpdateMW, 
  updateRawMaterials);
route.delete("/:id",deleteRawMaterials);

//export
export default route;