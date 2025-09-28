import express from 'express';
const router = express.Router();
// Import expenses controller
import * as expensesController from '../controller/expensesController.js';
import upload from '../middleware/expenseupload.js';

// GET all expenses
router.get('/', expensesController.getAllExpenses);

// GET expense by ID
router.get('/filter', expensesController.getExpensesByProjectAndCategory);

// CREATE expense (multipart form for proof)
router.post('/', upload.single('proof'), expensesController.createExpense);

// UPDATE expense by ID
router.post('/:id', expensesController.updateMiscExpense);

export default router;
