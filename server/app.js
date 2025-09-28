
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from './config/logger.js';
import { env } from './config/env.js';

// Configure dotenv
dotenv.config();

// Supplier routes
import purchaseOrderRouter from "./modules/supplier/routes/purchaseOrder.routes.js";
import supplierRouter from "./modules/supplier/routes/supplier.routes.js";
import supplierRatingRouter from "./modules/supplier/routes/supplierRating.routes.js";
import materialRouter from "./modules/supplier/routes/material.routes.js";
import sampleRouter from "./modules/supplier/routes/sample.routes.js";
import dashboardRouter from "./modules/supplier/routes/dashboard.routes.js";

import './modules/project/model/project.model.js';
import './modules/project/model/task.model.js';
import './modules/project/model/team.model.js';
import './modules/project/model/milestone.model.js';
import './modules/project/model/material.model.js';
import './modules/project/model/meeting.model.js';
import './modules/project/model/progressupdate.model.js';

//Routes
import projectRoutes from './modules/project/routes/project.routes.js';
import taskRoutes from './modules/project/routes/task.routes.js';
import teamRoutes from './modules/project/routes/team.routes.js';
import kpiRoutes from './modules/project/routes/kpi.routes.js';
import viewReportRoutes from './modules/project/routes/viewReport.routes.js';
import downloadReportRoutes from './modules/project/routes/downloadReport.routes.js';
import completeArchiveRoutes from './modules/project/routes/completeArchive.routes.js';
import milestoneTimelineRoutes from './modules/project/routes/milestoneTimeline.routes.js';
import attendanceRoutes from './modules/project/routes/attendance.routes.js';
import materialRequestRoutes from './modules/project/routes/materialRequest.routes.js';
import reportRoutes from './modules/project/routes/report.routes.js';
import fileRoutes from './modules/project/routes/file.routes.js';
import meetingRoutes from './modules/project/routes/meeting.routes.js';
import fileServeRoutes from './routes/fileServe.js';
import uploadRoutes from './routes/upload.routes.js';

// Auth routes
import authRouter from "./modules/auth/routes/authRouter.js";
import userRouter from "./modules/auth/routes/userRouter.js";
import paymentReceiptRoutes from "./modules/auth/routes/paymentReceiptRoutes.js";
import inspectorLocationRoutes from "./modules/auth/routes/inspectorLocationRoutes.js";
import assignmentRoutes from "./modules/auth/routes/assignmentRoutes.js";
import authReportRoutes from "./modules/auth/routes/reportRoutes.js";
import inspectionRequestRoutes from "./modules/auth/routes/inspectionRequestRoutes.js";
import inspectionFormRoutes from "./modules/auth/routes/inspectionFormRoutes.js";

const app = express();

// Middleware
app.use(cors()); // Allow CORS API requests from different origins
app.use(express.json({limit: '2mb'})); // Parse JSON body with 2MB limit
app.use(express.urlencoded({ extended: true })); // Parse urlencoded body

// Static files
app.use('/reports', express.static('public/reports'));

// Mount supplier routes
app.use("/api/suppliers", supplierRouter);
app.use("/api/supplierRating", supplierRatingRouter);
app.use("/api/supplier-ratings", supplierRatingRouter); // Alternative naming for frontend
app.use("/supplierRating", supplierRatingRouter); // Legacy path
app.use("/api/purchase-orders", purchaseOrderRouter);
app.use("/api/materials", materialRouter);
app.use("/api/samples", sampleRouter);
app.use("/api/dashboard", dashboardRouter);

// Mount auth routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/payment-receipt", paymentReceiptRoutes);
app.use("/api/inspector-location", inspectorLocationRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/auth-reports", authReportRoutes);
app.use("/api/inspection-request", inspectionRequestRoutes);
app.use("/api/inspectorForms", inspectionFormRoutes);

// Mount project routes
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', teamRoutes);
app.use('/api', kpiRoutes);
app.use('/api', viewReportRoutes);
app.use('/api', downloadReportRoutes);
app.use('/api', completeArchiveRoutes);
app.use('/api', milestoneTimelineRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', materialRequestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', fileRoutes);
app.use('/api', meetingRoutes);
app.use('/api', fileServeRoutes);
app.use('/api', uploadRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    name: env.APP_NAME,
    env: env.NODE_ENV,
    status: "ok",
    time: new Date().toISOString(),
  });
});

// Database connection and server startup
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
