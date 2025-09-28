import * as expenseService from '../service/expensesService.js';
import { adjustBalance } from '../service/financeSummaryService.js';

// Get all expenses
const getAllExpenses = async (req, res, next) => {
    try {
        const expenses = await expenseService.getAllExpenses();
        if (!expenses || expenses.length === 0) {
            return res.status(404).json([]);
        }
        return res.status(200).json(expenses);
    } catch (err) {
        console.error(err);
        return res.status(500).json([]);
    }
};

// Get expense by ID and category
const getExpensesByProjectAndCategory = async (req, res, next) => {
    const { projectId, category } = req.query; // e.g., /expenses?projectId=xxx&category=Misc

    if (!projectId || !category) {
        return res.status(400).json({ message: "projectId and category are required" });
    }

    let expenses;
    try {
        expenses = await expenseService.getExpensesByProjectAndCategory(projectId, category);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }

    if (!expenses || expenses.length === 0) {
        return res.status(404).json({ message: "No Expenses Found for this project and category" });
    }

    return res.status(200).json({ expenses });
};

// Update expense by _id
const updateMiscExpense = async (req, res, next) => {
    const { amount, description } = req.body;
    let proof;

    // If file is uploaded
    if (req.file) {
        // normalize Windows backslashes to forward slashes for URL usage
        proof = req.file.path.replace(/\\/g, '/');
    }

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Expense _id is required to update an expense" });
    }

    let expense;
    try {
        expense = await expenseService.updateExpenseById(
            id,
            { amount, description, proof }
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }

    if (!expense) {
        return res.status(404).json({ message: "Expense not found or unable to update" });
    }

    return res.status(200).json({ expense });
};


export {
    getAllExpenses,
    updateMiscExpense,
    getExpensesByProjectAndCategory
};

// Create expense (POST /api/expenses)
export const createExpense = async (req, res) => {
    try {
    const { projectId, description, category, amount } = req.body;
    // normalize Windows backslashes to forward slashes for URL usage
    const proof = req.file ? req.file.path.replace(/\\/g, '/') : undefined;
        const created = await expenseService.createExpense({ projectId, description, category, amount, proof });
        // Decrease totalBalance by expense amount
        const amtNum = Number(amount) || 0;
        if (amtNum > 0) {
            await adjustBalance(-amtNum);
        }
        return res.status(201).json({ expense: created });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server Error' });
    }
};
