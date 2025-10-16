import * as expenseService from '../service/expensesService.js';
import { adjustBalance } from '../service/financeSummaryService.js';
import * as notificationService from '../service/financeNotificationService.js';
import Project from '../../project/model/project.model.js';
import ProjectEstimation from '../model/project_estimation.js';
import Expense from '../model/expenses.js';

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

        // Get project details
        const project = await Project.findById(projectId);
        
        // Notify finance managers
        await notificationService.notifyFinanceManagers({
            eventType: 'expense_added',
            title: 'New Expense Added',
            message: `New ${category} expense of LKR ${amount} added for project ${project?.projectName || 'Unknown'}`,
            relatedEntity: {
                entityType: 'Expense',
                entityId: created._id
            },
            metadata: {
                amount: amtNum,
                category,
                projectName: project?.projectName,
                description
            },
            priority: 'medium'
        });

        // Check if expense exceeds budget
        if (projectId) {
            const latestEstimation = await ProjectEstimation.findOne({ projectId })
                .sort({ version: -1 });
            
            if (latestEstimation) {
                // Get all expenses by category for this project
                const expensesAgg = await Expense.aggregate([
                    { $match: { projectId: created.projectId } },
                    { $group: { _id: '$category', total: { $sum: '$amount' } } }
                ]);
                
                const categoryMap = {
                    Labor: latestEstimation.laborCost,
                    Procurement: latestEstimation.materialCost,
                    Transport: latestEstimation.serviceCost,
                    Misc: latestEstimation.contingencyCost
                };
                
                const budget = categoryMap[category] || 0;
                const totalExpenses = expensesAgg.find(e => e._id === category)?.total || 0;
                const percentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;
                
                // Notify if exceeds 80% threshold
                if (percentage >= 80) {
                    await notificationService.notifyFinanceManagers({
                        eventType: percentage >= 100 ? 'expense_exceeds_budget' : 'budget_threshold_exceeded',
                        title: percentage >= 100 ? 'Budget Exceeded' : 'Budget Threshold Alert',
                        message: `${category} expenses (LKR ${totalExpenses}) have reached ${percentage.toFixed(1)}% of budget (LKR ${budget}) for ${project?.projectName || 'project'}`,
                        relatedEntity: {
                            entityType: 'Expense',
                            entityId: created._id
                        },
                        metadata: {
                            category,
                            totalExpenses,
                            budget,
                            percentage: percentage.toFixed(1),
                            projectName: project?.projectName
                        },
                        priority: percentage >= 100 ? 'urgent' : 'high'
                    });

                    // Also notify project manager
                    if (project?.projectManagerId) {
                        await notificationService.createNotification({
                            userId: project.projectManagerId,
                            eventType: percentage >= 100 ? 'expense_exceeds_budget' : 'budget_threshold_exceeded',
                            title: percentage >= 100 ? 'Budget Exceeded' : 'Budget Threshold Alert',
                            message: `${category} expenses have reached ${percentage.toFixed(1)}% of budget for ${project.projectName}`,
                            relatedEntity: {
                                entityType: 'Expense',
                                entityId: created._id
                            },
                            metadata: {
                                category,
                                totalExpenses,
                                budget,
                                percentage: percentage.toFixed(1)
                            },
                            priority: percentage >= 100 ? 'urgent' : 'high'
                        });
                    }
                }
            }
        }

        return res.status(201).json({ expense: created });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server Error' });
    }
};
