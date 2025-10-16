import express from 'express';
import { getInProgressProjectExpenses } from '../controller/inProgressExpensesController.js';

const router = express.Router();

// GET /api/finance/in-progress-expenses
router.get('/in-progress-expenses', getInProgressProjectExpenses);

export default router;
