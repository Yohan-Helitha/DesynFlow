import purchaseOrderRouter from "./modules/supplier/routes/purchaseOrder.routes.js";
//2iWElcKr29ZOpPPf



import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import supplierRouter from "./modules/supplier/routes/supplier.routes.js";
import materialRouter from "./modules/supplier/routes/material.routes.js";
import sampleRouter from "./modules/supplier/routes/sample.routes.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount supplier router
app.use("/api/suppliers", supplierRouter);
// Mount purchase order router
app.use("/api/purchase-orders", purchaseOrderRouter);
// Mount material router
app.use("/api/materials", materialRouter);
// Mount sample router
app.use("/api/samples", sampleRouter);

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