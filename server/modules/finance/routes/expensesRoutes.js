const express = require('express');
const router = express.Router();
// Import expenses controller
const expensesController = require('../controllers/expensesController');

// GET all expenses
router.get('/', expensesController.getAllExpenses);

// GET expense by ID
router.get('/filter', expensesController.getExpensesByProjectAndCategory);

router.post('/:id', expensesController.updateMiscExpense);

module.exports = router;
