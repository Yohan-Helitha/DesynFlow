import React, { useState } from 'react';
import { Header } from '../Header';
import { AllWarranties } from './AllWarranties';
import { WarrantyRequest } from './WarrantyRequest';
import { WarrantyRequestHistory } from './WarrantyRequestHistory';

export const WarrantySection = () => {
  const [activeTab, setActiveTab] = useState('warranties');

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#FFF8E8]">
      <Header title="Warranty Management" />

      {/* Tab Navigation */}
      <div className="flex border-b border-[#AAB396] mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'warranties'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('warranties')}
        >
          Warranties
        </button>

        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'requests'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('requests')}
        >
          Warranty Requests
        </button>

        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'history'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Warranty Requests History
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'warranties' && <AllWarranties />}
        {activeTab === 'requests' && <WarrantyRequest />}
        {activeTab === 'history' && <WarrantyRequestHistory />}
      </div>
    </div>
  );
};
