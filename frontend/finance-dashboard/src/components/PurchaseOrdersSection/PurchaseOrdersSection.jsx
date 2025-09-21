import React, { useState } from 'react'
import { Header } from '../Header'
import { PendingPurchaseOrders } from './PendingPurchaseOrders'
import { ApprovedPurchaseOrders } from './ApprovedPurchaseOrders'

export const PurchaseOrdersSection = () => {
  const [activeTab, setActiveTab] = useState('pending')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header title="Purchase Orders" />
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
          Pending Purchase Orders
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'approved'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Purchase Orders
        </button>
      </div>
      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'pending' ? (
          <PendingPurchaseOrders />
        ) : (
          <ApprovedPurchaseOrders />
        )}
      </div>
    </div>
  )
}
