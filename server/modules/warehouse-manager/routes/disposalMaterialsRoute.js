import express from "express";
const route = express.Router();


//Insert Controller
import { 
  getAllDisposalMaterials,
  getDisposalMaterialsById, 
  getDisposalRecordById,
  addDisposalMaterials, 
  updateDisposalMaterials, 
  deleteDisposalMaterials 
} from "../controller/disposalMaterialsController.js";

  import { 
    validateDisposalMaterialsInsertMW, 
    validateDisposalMaterialsUpdateMW 
  } from "../middleware/disposalMaterialsMiddleware.js";

route.get("/",getAllDisposalMaterials);
route.get("/:id",getDisposalMaterialsById);
route.get("/record/:id",getDisposalRecordById);
route.post("/",
  validateDisposalMaterialsInsertMW, 
  addDisposalMaterials);
route.put("/:id",
  validateDisposalMaterialsUpdateMW, 
  updateDisposalMaterials);
route.delete("/:id",deleteDisposalMaterials);

//export
export default route;