import express from 'express';
import { downloadInspectionReport } from '../controller/downloadReport.controller.js';

const router = express.Router();

// Download inspection report PDF
router.get('/reports/:inspectionRequestId/download', downloadInspectionReport);

export default router;
