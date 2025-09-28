import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { SummaryCard } from './SummaryCard';
import { IncomeChart } from './IncomeChart';
// import { BudgetUtilizationChart } from './BudgetUtilizationChart';
import {
  Wallet,
  DollarSign,
  ClipboardCheck,
  CreditCard,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import { safeFetchJson } from '../utils/safeFetch';

export const Dashboard = () => {
  const [pendingCount, setPendingCount] = useState(null);
  const [pendingPaymentApprovals, setPendingPaymentApprovals] = useState(null);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [approvedEstimationsCount, setApprovedEstimationsCount] = useState(null);
  const [pendingPurchaseRequests, setPendingPurchaseRequests] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [
          poRes,
          inspRes,
          payPend,
          inspPayPend,
          sumRes,
          apprEst
        ] = await Promise.all([
          safeFetchJson('/api/purchase-orders?status=PendingFinanceApproval'),
          safeFetchJson('/api/inspection-estimation/pending'),
          safeFetchJson('/api/payments/pending'),
          safeFetchJson('/api/inspection-estimation/payment-pending'),
          safeFetchJson('/api/finance-summary'),
          safeFetchJson('/api/project-estimation/approved'),
        ]);
        setPendingPurchaseRequests(Array.isArray(poRes) ? poRes.length : 0);
        setPendingCount(Array.isArray(inspRes) ? inspRes.length : 0);
        setPendingPaymentApprovals(Array.isArray(payPend) ? payPend.length : 0 + Array.isArray(inspPayPend) ? inspPayPend.length : 0);
        setFinanceSummary(sumRes);
        setApprovedEstimationsCount(Array.isArray(apprEst) ? apprEst.length : 0);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  const handleCardClick = (destination) => {
    console.log(`Navigating to ${destination}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#FFF8E8]">
      <Header title="Dashboard" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-6">
        <SummaryCard
          title="Total Income"
          value={financeSummary ? financeSummary.totalIncome?.toLocaleString() : '...'}
          icon={
            <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636]">
              <DollarSign size={20} />
            </div>
          }
          change="+1.29%"
          changeType="positive"
          onClick={() => handleCardClick('income')}
        />

        <SummaryCard
          title="Total Balance"
          value={financeSummary ? financeSummary.totalBalance?.toLocaleString() : '...'}
          icon={
            <div className="w-10 h-10 rounded-full bg-[#AAB396] flex items-center justify-center text-white">
              <Wallet size={20} />
            </div>
          }
          change="+2.36%"
          changeType="positive"
          onClick={() => handleCardClick('balance')}
        />

        <SummaryCard
          title="Pending Inspection Estimates"
          count={pendingCount === null ? '...' : pendingCount}
          icon={
            <div className="w-10 h-10 rounded-full bg-[#674636] flex items-center justify-center text-white">
              <ClipboardCheck size={20} />
            </div>
          }
          onClick={() => handleCardClick('inspection-estimates')}
        />

        <SummaryCard
          title="Pending Payment Approvals"
          count={pendingPaymentApprovals === null ? '...' : pendingPaymentApprovals}
          icon={
            <div className="w-10 h-10 rounded-full bg-[#AAB396] flex items-center justify-center text-white">
              <CreditCard size={20} />
            </div>
          }
          onClick={() => handleCardClick('payment-approvals')}
        />

        <SummaryCard
          title="Pending Purchase Requests"
          count={pendingPurchaseRequests === null ? '...' : pendingPurchaseRequests}
          icon={
            <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636]">
              <ShoppingCart size={20} />
            </div>
          }
          onClick={() => handleCardClick('purchase-requests')}
        />

        <SummaryCard
          title="Pending Quotations Generations"
          count={approvedEstimationsCount === null ? '...' : approvedEstimationsCount}
          icon={
            <div className="w-10 h-10 rounded-full bg-[#674636] flex items-center justify-center text-white">
              <FileText size={20} />
            </div>
          }
          onClick={() => handleCardClick('quotations')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <IncomeChart />
        </div>
        {/* <div className="lg:col-span-1">
          <BudgetUtilizationChart />
        </div> */}
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <div className="bg-[#F7EED3] rounded-md p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-[#674636]">Recent Activity</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-start p-3 border-b border-[#AAB396]"
              >
                <div className="w-8 h-8 rounded-full bg-[#674636] flex items-center justify-center text-white mr-3">
                  {item % 2 === 0 ? <CreditCard size={16} /> : <FileText size={16} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#674636]">
                    {item % 2 === 0
                      ? `Payment of $${(Math.random() * 10000).toFixed(2)} approved`
                      : `New quotation #QT-2023-${100 + item} generated`}
                  </p>
                  <p className="text-xs text-[#AAB396] mt-1">
                    {`${Math.floor(Math.random() * 24)} hours ago`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
