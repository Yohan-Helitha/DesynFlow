import React, { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, TrendingDown, AlertTriangle, DollarSign, FileText } from 'lucide-react';

export const MonthlyReportSection = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [summary, setSummary] = useState([]);

  // Fetch report
  const fetchReport = async (year, month) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/monthly-reports?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch 6-month summary
  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/monthly-reports/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  useEffect(() => {
    fetchReport(selectedYear, selectedMonth);
    fetchSummary();
  }, [selectedYear, selectedMonth]);

  // Generate years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Download report as JSON
  const downloadReport = () => {
    if (!report) return;
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `finance-report-${selectedYear}-${selectedMonth}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return <div className="text-center py-8">Loading report...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#674636]">Monthly Financial Reports</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AAB396]"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AAB396]"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={downloadReport}
            className="flex items-center space-x-2 bg-[#674636] text-[#FFF8E8] px-4 py-2 rounded-md hover:bg-[#AAB396] transition-colors"
          >
            <Download size={18} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">Total Income</span>
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">
                LKR {report.incomeSummary.totalIncome.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {report.incomeSummary.paymentsCount} payments
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">Total Expenses</span>
                <TrendingDown size={20} className="text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-900">
                LKR {report.expenseSummary.totalExpenses.toLocaleString()}
              </div>
              <div className="text-xs text-red-600 mt-1">
                {report.expenseSummary.expensesCount} expenses
              </div>
            </div>

            <div className={`${report.cashFlow.netCashFlow >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${report.cashFlow.netCashFlow >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Net Cash Flow</span>
                <DollarSign size={20} className={report.cashFlow.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} />
              </div>
              <div className={`text-2xl font-bold ${report.cashFlow.netCashFlow >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                LKR {report.cashFlow.netCashFlow.toLocaleString()}
              </div>
              <div className={`text-xs ${report.cashFlow.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1`}>
                Balance: LKR {report.cashFlow.currentBalance.toLocaleString()}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">Alerts</span>
                <AlertTriangle size={20} className="text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {report.alerts.budgetThresholdBreaches}
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                Budget warnings
              </div>
            </div>
          </div>

          {/* Project Financial Health */}
          <div className="bg-[#F7EED3] rounded-lg p-6 border border-[#AAB396]">
            <h3 className="text-lg font-semibold text-[#674636] mb-4">Project Financial Health</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{report.projectFinancialHealth.onBudget}</div>
                <div className="text-sm text-gray-600">On Budget</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{report.projectFinancialHealth.atRisk}</div>
                <div className="text-sm text-gray-600">At Risk (80%+)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{report.projectFinancialHealth.overBudget}</div>
                <div className="text-sm text-gray-600">Over Budget</div>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-[#F7EED3] rounded-lg p-6 border border-[#AAB396]">
            <h3 className="text-lg font-semibold text-[#674636] mb-4">Expense Breakdown by Category</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(report.expenseSummary.byCategory).map(([category, amount]) => (
                <div key={category} className="bg-white rounded-lg p-4 border border-[#AAB396]">
                  <div className="text-sm font-medium text-[#674636] mb-1">{category}</div>
                  <div className="text-xl font-bold text-[#674636]">LKR {amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Analysis Table */}
          <div className="bg-[#F7EED3] rounded-lg p-6 border border-[#AAB396]">
            <h3 className="text-lg font-semibold text-[#674636] mb-4">Budget vs Actual by Project</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#AAB396]">
                    <th className="text-left py-2 px-4 text-[#674636]">Project</th>
                    <th className="text-right py-2 px-4 text-[#674636]">Budget</th>
                    <th className="text-right py-2 px-4 text-[#674636]">Actual</th>
                    <th className="text-right py-2 px-4 text-[#674636]">Variance</th>
                    <th className="text-right py-2 px-4 text-[#674636]">% Spent</th>
                    <th className="text-center py-2 px-4 text-[#674636]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.budgetAnalysis.map((project) => (
                    <tr key={project.projectId} className="border-b border-gray-200">
                      <td className="py-2 px-4 text-[#674636]">{project.projectName}</td>
                      <td className="text-right py-2 px-4">LKR {project.budget.total.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">LKR {project.actual.total.toLocaleString()}</td>
                      <td className={`text-right py-2 px-4 ${project.variance.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        LKR {project.variance.total.toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">{project.percentageSpent}%</td>
                      <td className="text-center py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.status === 'on_track' ? 'bg-green-100 text-green-800' :
                          project.status === 'at_risk' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6-Month Trend */}
          {summary.length > 0 && (
            <div className="bg-[#F7EED3] rounded-lg p-6 border border-[#AAB396]">
              <h3 className="text-lg font-semibold text-[#674636] mb-4">6-Month Trend</h3>
              <div className="grid grid-cols-6 gap-4">
                {summary.map((monthData) => (
                  <div key={`${monthData.year}-${monthData.month}`} className="bg-white rounded-lg p-3 border border-[#AAB396]">
                    <div className="text-xs font-medium text-[#674636] mb-2">{monthData.monthName}</div>
                    <div className="text-sm">
                      <div className="text-green-600">+{monthData.totalIncome.toLocaleString()}</div>
                      <div className="text-red-600">-{monthData.totalExpenses.toLocaleString()}</div>
                      <div className={`font-bold ${monthData.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {monthData.netCashFlow.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
