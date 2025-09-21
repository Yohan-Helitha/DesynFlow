import express from 'express';
const router = express.Router();
// Import expenses controller
import * as expensesController from '../controller/expensesController.js';

// GET all expenses
router.get('/', expensesController.getAllExpenses);

// GET expense by ID
router.get('/filter', expensesController.getExpensesByProjectAndCategory);

// UPDATE expense by ID
router.post('/:id', expensesController.updateMiscExpense);

export default router;
