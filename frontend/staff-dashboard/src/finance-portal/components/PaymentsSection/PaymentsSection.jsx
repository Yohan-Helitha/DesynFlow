import React, { useState } from 'react'
import { Header } from '../Header'
import { PendingPayments } from './PendingPayments'
import { CompletedPayments } from './CompletedPayments'

export const PaymentsSection = () => {
  const [activeTab, setActiveTab] = useState('pending')

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#FFF8E8] min-h-screen">
      <Header title="Payments" />

      {/* Tab Navigation */}
      <div className="flex border-b border-[#AAB396] mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors ${
            activeTab === 'pending'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Payments
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors ${
            activeTab === 'completed'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          Reviewed Payments
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4 bg-[#F7EED3] p-4 rounded-lg shadow">
        {activeTab === 'pending' ? <PendingPayments /> : <CompletedPayments />}
      </div>
    </div>
  )
}
