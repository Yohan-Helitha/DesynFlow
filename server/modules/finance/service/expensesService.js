import mongoose from 'mongoose';
import Expense from '../model/expenses.js';

// Get all expenses
const getAllExpenses = async () => {
    // newest first by createdAt
    return await Expense.find().sort({ createdAt: -1 });
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
    updateExpenseById,
};

// Create a new expense
export const createExpense = async ({ projectId, description, category, amount, proof }) => {
    const data = {
        projectId: projectId ? new mongoose.Types.ObjectId(projectId) : undefined,
        description,
        category,
        amount: Number(amount),
        proof: proof || null,
    };
    return await Expense.create(data);
};
