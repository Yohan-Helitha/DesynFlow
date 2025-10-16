import React, { useState } from 'react'
import { Header } from '../Header'

import { ExpensesChart } from './ExpensesChart'
import { ExpensesList } from './ExpensesList'

export const ExpensesSection = () => {
  // Key to force chart refresh when expenses change
  const [chartKey, setChartKey] = useState(0);

  const handleExpenseChange = () => {
    // Increment key to force chart to remount and refetch data
    setChartKey(prev => prev + 1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#FFF8E8] min-h-screen">
      <Header title="Expenses" />

      {/* Expenses Chart */}
      <div className="mb-4 bg-[#F7EED3] p-4 rounded-lg shadow">
        <ExpensesChart key={chartKey} />
      </div>
      {/* Expenses List */}
      <div className="bg-[#F7EED3] p-4 rounded-lg shadow">
        <ExpensesList onExpenseChange={handleExpenseChange} />
      </div>
    </div>
  )
}
