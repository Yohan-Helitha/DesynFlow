import React, { useState } from 'react'
import { Header } from '../Header'
import { ExpensesList } from './ExpensesList'

export const ExpensesSection = () => {
  // Only one tab now, so no need for activeTab

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header title="Expenses" />

      {/* Only Expenses List tab remains */}

      {/* Tab Content */}
      <div className="mt-4">
        <ExpensesList />
      </div>
    </div>
  )
}
