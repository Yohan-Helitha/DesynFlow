import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InspectionSection } from './components/InspectionSection/InspectionSection';
import { EstimationsSection } from './components/EstimationsSection/EstimationsSection';
import { QuotationsSection } from './components/QuotationsSection/QuotationsSection';
import { PaymentsSection } from './components/PaymentsSection/PaymentsSection';
import { PurchaseOrdersSection } from './components/PurchaseOrdersSection/PurchaseOrdersSection';
import { ExpensesSection } from './components/ExpensesSection/ExpensesSection';
import { WarrantySection } from './components/WarrantySection/WarrantySection';

export function App() {
  const [currentSection, setCurrentSection] = useState('dashboard');

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <Sidebar onNavigate={setCurrentSection} currentSection={currentSection} />
      <main className="flex-1 overflow-auto">
        {currentSection === 'dashboard' && <Dashboard />}
        {currentSection === 'inspections' && <InspectionSection />}
        {currentSection === 'estimations' && <EstimationsSection />}
        {currentSection === 'quotations' && <QuotationsSection />}
        {currentSection === 'payments' && <PaymentsSection />}
        {currentSection === 'purchaseOrders' && <PurchaseOrdersSection />}
        {currentSection === 'expenses' && <ExpensesSection />}
        {currentSection === 'warranty' && <WarrantySection />}
      </main>
    </div>
  );
}
