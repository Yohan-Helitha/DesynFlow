import express from 'express';
import { viewInspectionReport } from '../controller/viewReport.controller.js';

const router = express.Router();

router.get('/reports/:inspectionRequestId', viewInspectionReport);

export default router;
