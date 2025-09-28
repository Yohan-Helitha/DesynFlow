import React, { useState } from 'react'
import { Header } from '../Header'
import { PendingPurchaseOrders } from './PendingPurchaseOrders'
import { ApprovedPurchaseOrders } from './ApprovedPurchaseOrders'

export const PurchaseOrdersSection = () => {
  const [activeTab, setActiveTab] = useState('pending')

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#FFF8E8] min-h-screen">
      <Header title="Purchase Orders" />

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
          Pending Purchase Orders
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors ${
            activeTab === 'approved'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Purchase Orders
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4 bg-[#F7EED3] p-4 rounded-md shadow-sm">
        {activeTab === 'pending' ? (
          <PendingPurchaseOrders />
        ) : (
          <ApprovedPurchaseOrders />
        )}
      </div>
    </div>
  )
}
