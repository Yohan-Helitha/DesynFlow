import * as reportService from '../service/monthlyReportService.js';
import * as notificationService from '../service/financeNotificationService.js';

// Get monthly report for specified month/year
export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const report = await reportService.getMonthlyReport(yearNum, monthNum);
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get current month report
export const getCurrentMonthReport = async (req, res) => {
  try {
    const report = await reportService.getCurrentMonthReport();
    res.json(report);
  } catch (error) {
    console.error('Error fetching current month report:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate and notify about monthly report
export const generateAndNotifyReport = async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const report = await reportService.getMonthlyReport(yearNum, monthNum);
    
    // Notify finance managers about report generation
    await notificationService.notifyFinanceManagers({
      eventType: 'report_generated',
      title: 'Monthly Financial Report Generated',
      message: `Financial report for ${report.reportMetadata.period.monthName} ${yearNum} has been generated.`,
      metadata: {
        year: yearNum,
        month: monthNum,
        totalIncome: report.incomeSummary.totalIncome,
        totalExpenses: report.expenseSummary.totalExpenses,
        netCashFlow: report.cashFlow.netCashFlow
      },
      priority: 'medium'
    });

    res.json({ 
      message: 'Report generated and notifications sent',
      report 
    });
  } catch (error) {
    console.error('Error generating and notifying report:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get report summary (last 6 months from selected date or current date)
export const getReportSummary = async (req, res) => {
  try {
    // Allow year and month to be passed as query params, default to current date
    const { year, month } = req.query;
    
    let baseDate;
    if (year && month) {
      baseDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    } else {
      baseDate = new Date();
    }
    
    const reports = [];
    
    // Get last 6 months from the base date
    for (let i = 0; i < 6; i++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const reportYear = date.getFullYear();
      const reportMonth = date.getMonth() + 1;
      
      const report = await reportService.getMonthlyReport(reportYear, reportMonth);
      reports.push({
        year: reportYear,
        month: reportMonth,
        monthName: report.reportMetadata.period.monthName,
        totalIncome: report.incomeSummary.totalIncome,
        totalExpenses: report.expenseSummary.totalExpenses,
        netCashFlow: report.cashFlow.netCashFlow,
        projectsOverBudget: report.projectFinancialHealth.overBudget,
        alerts: report.alerts.budgetThresholdBreaches
      });
    }
    
    res.json(reports);
  } catch (error) {
    console.error('Error generating report summary:', error);
    res.status(500).json({ error: error.message });
  }
};
