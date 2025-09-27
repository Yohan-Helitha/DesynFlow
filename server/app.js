import purchaseOrderRouter from "./modules/supplier/routes/purchaseOrder.routes.js";
//2iWElcKr29ZOpPPf



import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import supplierRouter from "./modules/supplier/routes/supplier.routes.js";
import supplierRatingRouter from "./modules/supplier/routes/supplierRating.routes.js";
import materialRouter from "./modules/supplier/routes/material.routes.js";
import sampleRouter from "./modules/supplier/routes/sample.routes.js";
import dashboardRouter from "./modules/supplier/routes/dashboard.routes.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount supplier router
app.use("/api/suppliers", supplierRouter);
// Mount supplier rating router (primary + legacy path for compatibility)
app.use("/api/supplierRating", supplierRatingRouter);
app.use("/api/supplier-ratings", supplierRatingRouter); // Alternative naming for frontend
app.use("/supplierRating", supplierRatingRouter); // legacy/non-versioned path
console.log("Mounted supplierRating routes at /api/supplierRating, /api/supplier-ratings and /supplierRating");
// Mount purchase order router
app.use("/api/purchase-orders", purchaseOrderRouter);
// Mount material router
app.use("/api/materials", materialRouter);
// Mount sample router
app.use("/api/samples", sampleRouter);
// Mount dashboard router
app.use("/api/dashboard", dashboardRouter);

const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

mongoose.connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.log("MongoDB connection error:", err));

export { app };