import React, { useState } from 'react'
import { Header } from '../Header'
import { PendingPayments } from './PendingPayments'
import { CompletedPayments } from './CompletedPayments'

export const PaymentsSection = () => {
  const [activeTab, setActiveTab] = useState('pending')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header title="Payments" />
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'pending'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Payments
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'completed'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          Reviewed Payments
        </button>
      </div>
      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'pending' ? <PendingPayments /> : <CompletedPayments />}
      </div>
    </div>
  )
}
