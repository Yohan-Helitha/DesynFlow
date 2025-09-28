import React, { useState } from 'react';
import InspectionRequests from '../components/InspectionRequests';
import PaymentManagement from '../components/PaymentManagement';
import InspectorAssignment from '../components/InspectorAssignment';
import CSRSidebar from '../components/CSRSidebar';

const CSRDashboard = () => {
  const [activeSection, setActiveSection] = useState('requests');

  const renderContent = () => {
    switch (activeSection) {
      case 'requests':
        return <InspectionRequests />;
      case 'payments':
        return <PaymentManagement />;
      case 'assign':
        return <InspectorAssignment />;
      default:
        return <InspectionRequests />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <CSRSidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Section Header */}
        <div className="mb-6">
          {activeSection === 'requests' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-2xl font-bold text-blue-800 mb-2">📋 Inspection Requests</h2>
              <p className="text-blue-700">
                View and manage client inspection requests. Each request shows client details, 
                property location, and preferred inspection date.
              </p>
            </div>
          )}
          
          {activeSection === 'payments' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-2xl font-bold text-green-800 mb-2">💰 Payment Management</h2>
              <p className="text-green-700">
                Handle inspection costs and payment details from finance manager. 
                Send payment information to clients via email.
              </p>
            </div>
          )}
          
          {activeSection === 'assign' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h2 className="text-2xl font-bold text-purple-800 mb-2">👨‍🔧 Inspector Assignment</h2>
              <p className="text-purple-700">
                Assign available inspectors to client requests. View inspector locations 
                and manage assignments efficiently.
              </p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CSRDashboard;