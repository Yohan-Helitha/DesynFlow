import Payment from '../model/payment.js';
import Expense from '../model/expenses.js';
import ProjectEstimation from '../model/project_estimation.js';
import QuotationEstimation from '../model/quotation_estimation.js';
import PurchaseOrder from '../../supplier/model/purchaseOrder.model.js';
import Project from '../../project/model/project.model.js';
import FinanceSummary from '../model/finance_summary.js';
import mongoose from 'mongoose';

// Generate monthly financial report
export const generateMonthlyReport = async (year, month) => {
  try {
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. INCOME SUMMARY
    const payments = await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('projectId', 'projectName').populate('clientId', 'username email');

    const approvedPayments = payments.filter(p => p.status === 'Approved');
    const totalIncome = approvedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const incomeByType = approvedPayments.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + p.amount;
      return acc;
    }, {});

    const incomeByMethod = approvedPayments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {});

    // 2. EXPENSE SUMMARY
    const expenses = await Expense.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('projectId', 'projectName');

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const expensesByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const expensesByProject = {};
    expenses.forEach(e => {
      const projectName = e.projectId?.projectName || 'Unknown';
      if (!expensesByProject[projectName]) {
        expensesByProject[projectName] = { Labor: 0, Procurement: 0, Transport: 0, Misc: 0, total: 0 };
      }
      expensesByProject[projectName][e.category] = (expensesByProject[projectName][e.category] || 0) + e.amount;
      expensesByProject[projectName].total += e.amount;
    });

    // 3. BUDGET VS ACTUAL ANALYSIS
    const projectIds = [...new Set(expenses.map(e => e.projectId).filter(Boolean))];
    const budgetAnalysis = [];

    for (const projectId of projectIds) {
      const project = await Project.findById(projectId);
      if (!project) continue;

      const latestEstimation = await ProjectEstimation.findOne({ projectId })
        .sort({ version: -1 });

      if (!latestEstimation) continue;

      const projectExpenses = expenses.filter(e => e.projectId?.toString() === projectId.toString());
      const expensesByCategory = projectExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, { Labor: 0, Procurement: 0, Transport: 0, Misc: 0 });

      const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
      const totalBudget = latestEstimation.total || 0;
      const variance = totalBudget - totalExpenses;
      const percentageSpent = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

      budgetAnalysis.push({
        projectId: projectId.toString(),
        projectName: project.projectName,
        budget: {
          Labor: latestEstimation.laborCost || 0,
          Procurement: latestEstimation.materialCost || 0,
          Transport: latestEstimation.serviceCost || 0,
          Misc: latestEstimation.contingencyCost || 0,
          total: totalBudget
        },
        actual: {
          Labor: expensesByCategory.Labor,
          Procurement: expensesByCategory.Procurement,
          Transport: expensesByCategory.Transport,
          Misc: expensesByCategory.Misc,
          total: totalExpenses
        },
        variance: {
          Labor: (latestEstimation.laborCost || 0) - expensesByCategory.Labor,
          Procurement: (latestEstimation.materialCost || 0) - expensesByCategory.Procurement,
          Transport: (latestEstimation.serviceCost || 0) - expensesByCategory.Transport,
          Misc: (latestEstimation.contingencyCost || 0) - expensesByCategory.Misc,
          total: variance
        },
        percentageSpent: percentageSpent.toFixed(2),
        status: percentageSpent > 100 ? 'over_budget' : percentageSpent > 80 ? 'at_risk' : 'on_track'
      });
    }

    // 4. PROJECT FINANCIAL HEALTH
    const projectsOnBudget = budgetAnalysis.filter(p => p.status === 'on_track').length;
    const projectsOverBudget = budgetAnalysis.filter(p => p.status === 'over_budget').length;
    const projectsAtRisk = budgetAnalysis.filter(p => p.status === 'at_risk').length;

    // 5. CASH FLOW
    const financeSummary = await FinanceSummary.findOne();
    const netCashFlow = totalIncome - totalExpenses;

    // 6. PAYMENT STATUS
    const pendingPayments = payments.filter(p => p.status === 'Pending');
    const rejectedPayments = payments.filter(p => p.status === 'Rejected');

    const paymentStatus = {
      pending: {
        count: pendingPayments.length,
        amount: pendingPayments.reduce((sum, p) => sum + p.amount, 0)
      },
      approved: {
        count: approvedPayments.length,
        amount: totalIncome
      },
      rejected: {
        count: rejectedPayments.length,
        amount: rejectedPayments.reduce((sum, p) => sum + p.amount, 0)
      }
    };

    // 7. QUOTATION & ESTIMATION STATUS
    const quotations = await QuotationEstimation.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const estimations = await ProjectEstimation.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const quotationStatus = {
      created: quotations.length,
      approved: quotations.filter(q => q.status === 'Approved').length,
      rejected: quotations.filter(q => q.status === 'Rejected').length,
      pending: quotations.filter(q => q.status === 'Pending').length
    };

    const estimationStatus = {
      submitted: estimations.length,
      approved: estimations.filter(e => e.status === 'Approved').length,
      rejected: estimations.filter(e => e.status === 'Rejected').length,
      pending: estimations.filter(e => e.status === 'Pending').length
    };

    // 8. PURCHASE ORDERS
    const purchaseOrders = await PurchaseOrder.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const poStatus = {
      total: purchaseOrders.length,
      totalValue: purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0),
      byStatus: purchaseOrders.reduce((acc, po) => {
        acc[po.status] = (acc[po.status] || 0) + 1;
        return acc;
      }, {}),
      financeApproved: purchaseOrders.filter(po => po.financeApproval?.status === 'Approved').length,
      financePending: purchaseOrders.filter(po => po.financeApproval?.status === 'Pending').length,
      financeRejected: purchaseOrders.filter(po => po.financeApproval?.status === 'Rejected').length
    };

    // 9. ALERTS & NOTIFICATIONS
    const alerts = {
      budgetThresholdBreaches: budgetAnalysis.filter(p => parseFloat(p.percentageSpent) >= 80).length,
      projectsOverBudget: projectsOverBudget,
      pendingPaymentsCount: pendingPayments.length,
      highValuePendingPayments: pendingPayments.filter(p => p.amount > 100000).length
    };

    // Compile final report
    const report = {
      reportMetadata: {
        generatedAt: new Date(),
        period: {
          year,
          month,
          startDate,
          endDate,
          monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' })
        }
      },
      incomeSummary: {
        totalIncome,
        paymentsCount: approvedPayments.length,
        byType: incomeByType,
        byMethod: incomeByMethod
      },
      expenseSummary: {
        totalExpenses,
        expensesCount: expenses.length,
        byCategory: expensesByCategory,
        byProject: expensesByProject
      },
      budgetAnalysis,
      projectFinancialHealth: {
        total: budgetAnalysis.length,
        onBudget: projectsOnBudget,
        atRisk: projectsAtRisk,
        overBudget: projectsOverBudget
      },
      cashFlow: {
        totalIncome,
        totalExpenses,
        netCashFlow,
        currentBalance: financeSummary?.totalBalance || 0
      },
      paymentStatus,
      quotationStatus,
      estimationStatus,
      purchaseOrderStatus: poStatus,
      alerts
    };

    return report;
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw error;
  }
};

// Get report for a specific month
export const getMonthlyReport = async (year, month) => {
  return await generateMonthlyReport(year, month);
};

// Get report for current month
export const getCurrentMonthReport = async () => {
  const now = new Date();
  return await generateMonthlyReport(now.getFullYear(), now.getMonth() + 1);
};
