import React, { useState } from 'react'
import { Header } from '../Header'
import { PendingQuotations } from './PendingQuotations'
import { ApprovedQuotations } from './ApprovedQuotations'

export const QuotationsSection = () => {
  const [activeTab, setActiveTab] = useState('pending')

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#FFF8E8] min-h-screen">
      <Header title="Quotations" />

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
          Pending Quotations
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors ${
            activeTab === 'approved'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Quotations
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4 bg-[#F7EED3] p-4 rounded-lg shadow">
        {activeTab === 'pending' ? (
          <PendingQuotations />
        ) : (
          <ApprovedQuotations />
        )}
      </div>
    </div>
  )
}
