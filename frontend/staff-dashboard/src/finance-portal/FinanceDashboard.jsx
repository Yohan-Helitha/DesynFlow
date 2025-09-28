import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { InspectionSection } from './components/InspectionSection/InspectionSection';
import { EstimationsSection } from './components/EstimationsSection/EstimationsSection';
import { QuotationsSection } from './components/QuotationsSection/QuotationsSection';
import { PaymentsSection } from './components/PaymentsSection/PaymentsSection';
import { PurchaseOrdersSection } from './components/PurchaseOrdersSection/PurchaseOrdersSection';
import { ExpensesSection } from './components/ExpensesSection/ExpensesSection';
import { WarrantySection } from './components/WarrantySection/WarrantySection';

function FinanceDashboard() {
  return (
    <Routes>
      {/* Finance Dashboard Routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inspections" element={<InspectionSection />} />
      <Route path="/estimations" element={<EstimationsSection />} />
      <Route path="/quotations" element={<QuotationsSection />} />
      <Route path="/payments" element={<PaymentsSection />} />
      <Route path="/purchase-orders" element={<PurchaseOrdersSection />} />
      <Route path="/expenses" element={<ExpensesSection />} />
      <Route path="/warranty" element={<WarrantySection />} />
    </Routes>
  );
}

export default FinanceDashboard;