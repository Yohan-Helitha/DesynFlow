import React from 'react';
import { Header } from '../Header';
import { MonthlyReportSection } from './MonthlyReportSection';

export const ReportsSection = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#FFF8E8] min-h-screen">
      <Header title="Financial Reports" />
      
      <div className="mt-4">
        <MonthlyReportSection />
      </div>
    </div>
  );
};
