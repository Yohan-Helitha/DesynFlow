import express from "express";
const route = express.Router();

import { getAllThresholdAlerts } from "../controller/thresholdAlertController.js";

// GET all
route.get("/", getAllThresholdAlerts);

//export
export default route;