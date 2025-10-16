import express from 'express';
import * as reportController from '../controller/monthlyReportController.js';

const router = express.Router();

// GET /api/monthly-reports?year=2025&month=10
router.get('/', reportController.getMonthlyReport);

// GET /api/monthly-reports/current
router.get('/current', reportController.getCurrentMonthReport);

// GET /api/monthly-reports/summary (last 6 months)
router.get('/summary', reportController.getReportSummary);

// POST /api/monthly-reports/generate (generate and notify)
router.post('/generate', reportController.generateAndNotifyReport);

export default router;
