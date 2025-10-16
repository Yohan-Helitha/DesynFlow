import mongoose from 'mongoose';
import Expense from '../model/expenses.js';

// Get all expenses
const getAllExpenses = async () => {
    // newest first by createdAt, populate project details
    return await Expense.find()
        .populate('projectId', 'projectName status location clientId')
        .populate('createdBy', 'name email username')
        .sort({ createdAt: -1 });
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
    // Validate and convert projectId to ObjectId
    let validProjectId = undefined;
    if (projectId && projectId !== '' && projectId !== 'undefined' && projectId !== 'null') {
        try {
            validProjectId = new mongoose.Types.ObjectId(projectId);
        } catch (error) {
            console.error('Invalid projectId format:', projectId, error);
            throw new Error('Invalid project ID format');
        }
    }
    
    const data = {
        projectId: validProjectId,
        description,
        category,
        amount: Number(amount),
        proof: proof || null,
    };
    
    console.log('Creating expense with data:', data); // Debug log
    
    return await Expense.create(data);
};
