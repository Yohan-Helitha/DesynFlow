import React, { useState, useEffect } from 'react';
import { PendingInspections } from './PendingInspections';
import { InspectionPayments } from './InspectionPayments';
import { InspectionPaymentsHistory } from './InspectionPaymentsHistory';
import { Header } from '../Header';
import { ViewHistoryModal } from './ViewHistoryModal';

export const InspectionSection = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'pending');
  const [estimationHistory, setEstimationHistory] = useState([]);
  const [loadingEstimation, setLoadingEstimation] = useState(false);
  const [estimationError, setEstimationError] = useState(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === 'estimationHistory') {
      setLoadingEstimation(true);
      setEstimationError(null);
      fetch('/api/inspection-estimation/all-estimation-details')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch estimation history');
          return res.json();
        })
        .then(data => setEstimationHistory(data))
        .catch(err => setEstimationError(err.message))
        .finally(() => setLoadingEstimation(false));
    }
  }, [activeTab]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#FFF8E8] min-h-screen">
      <Header title="Inspection Management" />

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
          Pending Inspections
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors ${
            activeTab === 'estimationHistory'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('estimationHistory')}
        >
          Inspection Estimation History
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors ${
            activeTab === 'payments'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('payments')}
        >
          Inspection Payments
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors ${
            activeTab === 'paymentsHistory'
              ? 'border-b-2 border-[#674636] text-[#674636]'
              : 'text-[#AAB396] hover:text-[#674636]'
          }`}
          onClick={() => setActiveTab('paymentsHistory')}
        >
          Inspection Payments History
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4 bg-[#F7EED3] p-4 rounded-lg shadow">
        {activeTab === 'pending' && <PendingInspections />}
        {activeTab === 'estimationHistory' && (
          loadingEstimation ? (
            <div className="text-center py-8">Loading estimation history...</div>
          ) : estimationError ? (
            <div className="text-center text-red-500 py-8">{estimationError}</div>
          ) : (
            <ViewHistoryModal historyData={estimationHistory} />
          )
        )}
        {activeTab === 'payments' && <InspectionPayments />}
        {activeTab === 'paymentsHistory' && <InspectionPaymentsHistory />}
      </div>
    </div>
  );
};
