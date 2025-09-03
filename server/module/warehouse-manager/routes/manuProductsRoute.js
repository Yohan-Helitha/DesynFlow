import express from "express";
const route = express.Router();

//Insert Model
import manuProducts from "../model/manuProductsModel.js";

//Insert Controller
import { 
  getAllManuProducts,
  getManuProductById, 
  addManuProducts, 
  updateManuProducts, 
  deleteManuProducts 
} from "../controller/manuProductsController.js";

// import { 
//   validateManuProductInsertMW, validateManuProductUpdateMW 
// } from "../middleware/manuProductsMiddleware.js";

route.get("/",getAllManuProducts);
route.get("/:id", getManuProductById); 
route.post("/",
  //validateManuProductInsertMW,
  addManuProducts);
route.put("/:id",
  //validateManuProductUpdateMW, 
  updateManuProducts);
route.delete("/:id",deleteManuProducts);

//export
export default route;