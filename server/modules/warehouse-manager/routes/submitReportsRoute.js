import express from "express";
import multer from "multer";
import {
  getAllReports,
  getReportById,
  addReport,
  updateReport,
  deleteReport
} from "../controller/submitReportsController.js";

import {
  validateSubmitReportInsertMW,
  validateSubmitReportUpdateMW
} from "../middleware/submitReportsMiddleware.js";

const route = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Routes
route.get("/", getAllReports);
route.get("/:id", getReportById);
route.post("/", upload.single("reportFile"), validateSubmitReportInsertMW, addReport);
route.put("/:id", upload.single("reportFile"), validateSubmitReportUpdateMW, updateReport);
route.delete("/:id", deleteReport);

export default route;
