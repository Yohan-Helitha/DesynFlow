import express from "express";
const route = express.Router();

import { getAllAuditLog } from "../controller/auditLogController.js";

// GET all audit logs
route.get("/", getAllAuditLog);

// Export
export default route;
