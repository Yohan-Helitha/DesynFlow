//8Dm4kDgWR1ejBffM

import express from "express";
import mongoose from "mongoose";
import manuProductsRoute from "./routes/manuProductsRoute.js";
import rawMaterialsRoute from "./routes/rawMaterialsRoute.js";
import invLocationsRoute from "./routes/invLocationsRoute.js";
import stockMovementRoute from "./routes/stockMovementRoute.js";
import transferRequestRoute from "./routes/transferRequestRoute.js";
import sReorderRequestsRoute from "./routes/sReorderRequestsRoute.js";
import disposalMaterialsRoute from "./routes/disposalMaterialsRoute.js";
import auditLogRoute from "./routes/auditLogRoute.js";
import thresholdAlertRoute from "./routes/thresholdAlertRoute.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
 
//Middleware
app.use(express.json());
app.use("/manu_products",manuProductsRoute);
app.use("/raw_materials",rawMaterialsRoute);
app.use("/inv_locations",invLocationsRoute);
app.use("/stock_movement",stockMovementRoute);
app.use("/transfer_request",transferRequestRoute);
app.use("/s_reorder_requests",sReorderRequestsRoute);
app.use("/disposal_materials",disposalMaterialsRoute);
app.use("/audit_log",auditLogRoute);
app.use("/threshold_alert",thresholdAlertRoute);

mongoose.connect("mongodb+srv://Warehouse_Manager:8Dm4kDgWR1ejBffM@cluster0.gsaq3bj.mongodb.net/WarehouseManagement")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000);
})
.catch((err) => console.log(err));

