import express from "express";
const route = express.Router();

//Insert Model
import stockMovement from "../model/stockMovementModel.js";

//Insert Controller
import { 
  getAllStockMovement,
  getStockMovementById, 
  addStockMovement, 
  updateStockMovement, 
  deleteStockMovement 
} from "../controller/stockMovementController.js";

// import { 
//   validateStockMovementInsertMW, validateStockMovementUpdateMW 
// } from "../middleware/stockMovementMiddleware.js";

route.get("/",getAllStockMovement);
route.get("/:id", getStockMovementById);
route.post("/",
  //validateStockMovementInsertMW,
  addStockMovement);
route.put("/:id",
  //validateStockMovementUpdateMW, 
  updateStockMovement);
route.delete("/:id",deleteStockMovement);

//export
export default route;