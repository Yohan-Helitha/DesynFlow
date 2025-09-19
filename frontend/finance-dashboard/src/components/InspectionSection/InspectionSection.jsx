import React, { useState } from 'react'
import { PendingInspections } from './PendingInspections'
import { InspectionPayments } from './InspectionPayments'
import { Header } from '../Header'
export const InspectionSection = () => {
  const [activeTab, setActiveTab] = useState('pending')
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header title="Inspection Management" />
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'pending' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Inspections
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'payments' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('payments')}
        >
          Inspection Payments
        </button>
      </div>
      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'pending' ? (
          <PendingInspections />
        ) : (
          <InspectionPayments />
        )}
      </div>
    </div>
  )
}
