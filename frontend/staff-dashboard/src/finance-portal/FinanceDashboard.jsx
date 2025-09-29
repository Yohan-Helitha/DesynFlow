import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InspectionSection } from './components/InspectionSection/InspectionSection';
import { EstimationsSection } from './components/EstimationsSection/EstimationsSection';
import { QuotationsSection } from './components/QuotationsSection/QuotationsSection';
import { PaymentsSection } from './components/PaymentsSection/PaymentsSection';
import { PurchaseOrdersSection } from './components/PurchaseOrdersSection/PurchaseOrdersSection';
import { ExpensesSection } from './components/ExpensesSection/ExpensesSection';
import { WarrantySection } from './components/WarrantySection/WarrantySection';

function FinanceDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current section from URL path
  const getCurrentSection = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart === 'finance-manager' ? 'dashboard' : lastPart;
  };

  const handleNavigation = (section) => {
    if (section === 'dashboard') {
      navigate('/finance-manager');
    } else {
      navigate(`/finance-manager/${section}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#FFF8E8]">
      <Sidebar 
        onNavigate={handleNavigation} 
        currentSection={getCurrentSection()} 
      />
      <div className="flex-1 overflow-auto">
        <Routes>
          {/* Finance Dashboard Routes */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inspections" element={<InspectionSection />} />
          <Route path="estimations" element={<EstimationsSection />} />
          <Route path="quotations" element={<QuotationsSection />} />
          <Route path="payments" element={<PaymentsSection />} />
          <Route path="purchaseOrders" element={<PurchaseOrdersSection />} />
          <Route path="expenses" element={<ExpensesSection />} />
          <Route path="warranty" element={<WarrantySection />} />
        </Routes>
      </div>
    </div>
  );
}

export default FinanceDashboard;