import React from 'react'
import { Header } from '../Header'
import { ExpensesList } from './ExpensesList'

export const ExpensesSection = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#FFF8E8] min-h-screen">
      <Header title="Expenses" />

      {/* Expenses List */}
      <div className="mt-4 bg-[#F7EED3] p-4 rounded-lg shadow">
        <ExpensesList />
      </div>
    </div>
  )
}
