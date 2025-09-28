import express from "express";
const route = express.Router();

import { deleteAuditLog, getAllAuditLog } from "../controller/auditLogController.js";

// GET all audit logs
route.get("/", getAllAuditLog);
route.delete("/:id", deleteAuditLog);

// Export
export default route;
