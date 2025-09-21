import React, { useState } from 'react';
import { Header } from '../Header';
import { PendingEstimation } from './PendingEstimation';
import { EstimationsHistory } from './EstimationsHistory';

export const EstimationsSection = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#FFF8E8]">
      <Header title="Estimations Management" />

      {/* Tabs */}
      <div className="flex border-b border-[#AAB396] mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'pending'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Estimations
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'approved'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('approved')}
        >
          Estimations History
        </button>
      </div>

      {/* Content */}
      <div className="mt-4 bg-[#F7EED3] p-4 rounded-md shadow-sm">
  {activeTab === 'pending' ? <PendingEstimation /> : <EstimationsHistory />}
      </div>
    </div>
  );
};
