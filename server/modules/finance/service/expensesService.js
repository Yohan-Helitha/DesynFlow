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

// Update expense
const updateExpense = async (id, updateData) => {
    return await Expense.findByIdAndUpdate(id, updateData, { new: true });
};

const updateExpenseByProjectAndCategory = async (projectId, category, updateData) => {
    // Find the expense by projectId and category and update it
    return await Expense.findOneAndUpdate(
        { projectId, category },  // filter
        { $set: updateData },     // fields to update
        { new: true }             // return the updated document
    );
};

export {
    getAllExpenses,
    updateExpense,
    getExpensesByProjectAndCategory,
    updateExpenseByProjectAndCategory
};
