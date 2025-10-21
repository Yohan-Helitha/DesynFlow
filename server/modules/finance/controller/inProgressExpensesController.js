import Project from '../../project/model/project.model.js';
import Expense from '../model/expenses.js';
import ProjectEstimation from '../model/project_estimation.js';

// GET /api/finance/in-progress-expenses
export const getInProgressProjectExpenses = async (req, res) => {
  try {
    // 1. Find all In Progress projects
    const projects = await Project.find({ status: 'In Progress' });
    const results = [];
    for (const project of projects) {
      // 2. Sum expenses for this project by category
      const expensesAgg = await Expense.aggregate([
        { $match: { projectId: project._id } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ]);
      // 3. Get latest estimation (highest version)
      const latestEstimation = await ProjectEstimation.findOne({ projectId: project._id })
        .sort({ version: -1 });
      // Map estimation fields to categories
      const budgetByCategory = {
        Labor: latestEstimation?.laborCost || 0,
        Procurement: latestEstimation?.materialCost || 0,
        Transport: latestEstimation?.serviceCost || 0,
        Misc: latestEstimation?.contingencyCost || 0,
      };
      // Map expenses to categories
      const expensesByCategory = {
        Labor: 0, Procurement: 0, Transport: 0, Misc: 0
      };
      for (const e of expensesAgg) {
        if (expensesByCategory.hasOwnProperty(e._id)) {
          expensesByCategory[e._id] = e.total;
        }
      }
      results.push({
        projectId: project._id,
        projectName: project.projectName,
        projectManagerId: project.projectManagerId, // Include project manager ID
        expensesByCategory,
        budgetByCategory
      });
    }
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
