import mongoose from 'mongoose';
import Expense from '../model/expenses.js';

// Get all expenses
const getAllExpenses = async () => {
    return await Expense.find();
};

// Get expense by ID
const getExpensesByProjectAndCategory = async (projectId, category) => {
    return await Expense.find({ projectId, category });
};

// Update expense by _id
const updateExpenseById = async (id, updateData) => {
    return await Expense.findByIdAndUpdate(id, updateData, { new: true });
};

export {
    getAllExpenses,
    getExpensesByProjectAndCategory,
    updateExpenseById
};
