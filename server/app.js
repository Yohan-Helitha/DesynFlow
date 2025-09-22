import purchaseOrderRouter from "./modules/supplier/routes/purchaseOrder.routes.js";
//2iWElcKr29ZOpPPf



import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import supplierRouter from "./modules/supplier/routes/supplier.routes.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount supplier router
app.use("/api/suppliers", supplierRouter);
// Mount purchase order router
app.use("/api/purchase-orders", purchaseOrderRouter);

const mongoUri = process.env.MONGODB_URI;
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