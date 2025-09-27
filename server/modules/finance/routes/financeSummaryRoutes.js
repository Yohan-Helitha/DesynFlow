import express from 'express';
import { getFinanceSummary } from '../controller/financeSummaryController.js';

const router = express.Router();

// GET current finance summary
router.get('/', getFinanceSummary);

export default router;
