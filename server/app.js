
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
import supplierNotificationRouter from "./modules/supplier/routes/notification.routes.js";

import './modules/project/model/project.model.js';
import './modules/project/model/task.model.js';
import './modules/project/model/team.model.js';
import './modules/project/model/milestone.model.js';
import './modules/project/model/material.model.js';
import './modules/project/model/meeting.model.js';
import './modules/project/model/progressupdate.model.js';
import './modules/project/model/notification.model.js';

//Routes
import projectRoutes from './modules/project/routes/project.routes.js';
import taskRoutes from './modules/project/routes/task.routes.js';
import teamRoutes from './modules/project/routes/team.routes.js';
import progressUpdateRoutes from './modules/project/routes/progressupdate.routes.js';
import personalFileRoutes from './modules/project/routes/personalfile.routes.js';
import kpiRoutes from './modules/project/routes/kpi.routes.js';
import viewReportRoutes from './modules/project/routes/viewReport.routes.js';
import downloadReportRoutes from './modules/project/routes/downloadReport.routes.js';
import completeArchiveRoutes from './modules/project/routes/completeArchive.routes.js';
import milestoneTimelineRoutes from './modules/project/routes/milestoneTimeline.routes.js';
import attendanceRoutes from './modules/project/routes/attendance.routes.js';
import materialRequestRoutes from './modules/project/routes/materialRequest.routes.js';
import reportRoutes from './modules/project/routes/report.routes.js';
import inspectionReportRoutes from './modules/project/routes/inspectionReport.routes.js';
import budgetManagementRoutes from './modules/project/routes/budgetManagement.routes.js';
import fileRoutes from './modules/project/routes/file.routes.js';
import meetingRoutes from './modules/project/routes/meeting.routes.js';
import notificationRoutes from './modules/project/routes/notificationRoutes.js';
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
import pmNotificationRoutes from "./modules/auth/routes/pmNotificationRoutes.js";

// Warehouse routes
import manuProductsRoute from "./modules/warehouse-manager/routes/manuProductsRoute.js";
import rawMaterialsRoute from "./modules/warehouse-manager/routes/rawMaterialsRoute.js";
import invLocationsRoute from "./modules/warehouse-manager/routes/invLocationsRoute.js";
import stockMovementRoute from "./modules/warehouse-manager/routes/stockMovementRoute.js";
import transferRequestRoute from "./modules/warehouse-manager/routes/transferRequestRoute.js";
import sReorderRequestsRoute from "./modules/warehouse-manager/routes/sReorderRequestsRoute.js";
import disposalMaterialsRoute from "./modules/warehouse-manager/routes/disposalMaterialsRoute.js";
import auditLogRoute from "./modules/warehouse-manager/routes/auditLogRoute.js";
import thresholdAlertRoute from "./modules/warehouse-manager/routes/thresholdAlertRoute.js";
import warrantyClaimsRoute from "./modules/warehouse-manager/routes/warrantyClaimsRoute.js";
import submitReportsRoute from "./modules/warehouse-manager/routes/submitReportsRoute.js";

//finane routes

import projectRoute from './modules/finance/routes/projectRoutes.js';
import expensesRoute from './modules/finance/routes/expensesRoutes.js';
import inspectionEstimationRoute from './modules/finance/routes/inspectionEstimationRoutes.js';
import projectEstimationRoute from './modules/finance/routes/projectEstimationRoutes.js';
import paymentRoute from './modules/finance/routes/paymentRoutes.js';
import quotationRoute from './modules/finance/routes/quotationRoutes.js';
import purchaseOrderRoute from './modules/finance/routes/purchaseOrderRoutes.js';
import warrantyRoute from './modules/finance/routes/warrantyRoutes.js';
import claimRoute from './modules/finance/routes/claimRoutes.js';
import notificationRoute from './modules/finance/routes/notificationRoutes.js';
import materialRoute from './modules/finance/routes/materialRoutes.js';
import financeSummaryRoute from './modules/finance/routes/financeSummaryRoutes.js';
import inProgressExpensesRoutes from './modules/finance/routes/inProgressExpensesRoutes.js';
import financeNotificationRoutes from './modules/finance/routes/financeNotificationRoutes.js';
import monthlyReportRoutes from './modules/finance/routes/monthlyReportRoutes.js';

const app = express();

// Middleware
app.use(cors()); // Allow CORS API requests from different origins
app.use(express.json({limit: '2mb'})); // Parse JSON body with 2MB limit
app.use(express.urlencoded({ extended: true })); // Parse urlencoded body

// Static files
app.use('/reports', express.static('public/reports'));
// Serve uploaded files (e.g., generated PDFs)
app.use('/uploads', express.static('uploads'));

// Mount supplier routes
app.use("/api/suppliers", supplierRouter);
app.use("/api/supplierRating", supplierRatingRouter);
app.use("/api/supplier-ratings", supplierRatingRouter); // Alternative naming for frontend
app.use("/supplierRating", supplierRatingRouter); // Legacy path
app.use("/api/purchase-orders", purchaseOrderRouter);
app.use("/api/materials", materialRouter);
app.use("/api/samples", sampleRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/supplier-notifications", supplierNotificationRouter);

// Mount auth routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/payment-receipt", paymentReceiptRoutes);
app.use("/api/inspector-location", inspectorLocationRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/auth-reports", authReportRoutes);
app.use("/api/inspection-request", inspectionRequestRoutes);
app.use("/api/inspectorForms", inspectionFormRoutes);
app.use("/api/pm-notifications", pmNotificationRoutes);

// Mount project routes
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', teamRoutes);
app.use('/api', progressUpdateRoutes);
app.use('/api', personalFileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', kpiRoutes);
app.use('/api', viewReportRoutes);
app.use('/api', downloadReportRoutes);
app.use('/api', completeArchiveRoutes);
app.use('/api', milestoneTimelineRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', materialRequestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/project', inspectionReportRoutes);
app.use('/api/project', budgetManagementRoutes);
app.use('/api', fileRoutes);
app.use('/api', meetingRoutes);
app.use('/api', fileServeRoutes);
app.use('/api', uploadRoutes);

// Mount warehouse routes
app.use("/api/warehouse/manu_products", manuProductsRoute);
app.use("/api/warehouse/raw_materials", rawMaterialsRoute);
app.use("/api/warehouse/inv_locations", invLocationsRoute);
app.use("/api/warehouse/stock_movement", stockMovementRoute);
app.use("/api/warehouse/transfer_request", transferRequestRoute);
app.use("/api/warehouse/s_reorder_requests", sReorderRequestsRoute);
app.use("/api/warehouse/disposal_materials", disposalMaterialsRoute);
app.use("/api/warehouse/audit_log", auditLogRoute);
app.use("/api/warehouse/threshold_alert", thresholdAlertRoute);
app.use("/api/warehouse/warranty_claims", warrantyClaimsRoute);
app.use("/api/warehouse/submit-reports", submitReportsRoute);

//finance module routes

app.use('/api/expenses', expensesRoute);
app.use('/api/inspection-estimation', inspectionEstimationRoute);
app.use('/api/project-estimation', projectEstimationRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/quotations', quotationRoute);
app.use('/api/purchase-orders', purchaseOrderRoute);
app.use('/api/warranties', warrantyRoute);
app.use('/api/claims', claimRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/materials', materialRoute);
app.use('/api/finance-summary', financeSummaryRoute);
app.use('/api/finance', inProgressExpensesRoutes);
app.use('/api/finance-notifications', financeNotificationRoutes);
app.use('/api/monthly-reports', monthlyReportRoutes);

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
const port = process.env.PORT || 4000;

mongoose.connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.log("MongoDB connection error:", err));

export { app };
