import express from "express";
const route = express.Router();

import { getAllThresholdAlerts,deleteThresholdAlert } from "../controller/thresholdAlertController.js";

// GET all
route.get("/", getAllThresholdAlerts);
route.delete("/:id",deleteThresholdAlert)

//export
export default route;