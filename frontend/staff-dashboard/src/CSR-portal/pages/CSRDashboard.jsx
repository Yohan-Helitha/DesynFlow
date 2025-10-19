import React, { useState } from 'react';
import InspectionRequests from '../components/InspectionRequests';
import PaymentManagement from '../components/PaymentManagement';
import InspectorAssignment from '../components/InspectorAssignment';
import AssignmentStatusManager from '../components/AssignmentStatusManager';
import AssignmentHistory from '../components/AssignmentHistory';
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
      case 'status':
        return <AssignmentStatusManager />;
      case 'history':
        return <AssignmentHistory />;
      default:
        return <InspectionRequests />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-cream-light">
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
            <div className="bg-cream-primary border border-brown-primary rounded-lg p-4 inline-block">
              <h2 className="text-2xl font-bold text-dark-brown mb-2">
                📋 Inspection Requests
              </h2>
            </div>
          )}
          
          {activeSection === 'payments' && (
            <div className="bg-cream-primary border border-brown-primary rounded-lg p-4 inline-block">
              <h2 className="text-2xl font-bold text-dark-brown mb-2">
                💰 Payment Management
              </h2>        
            </div>
          )}
          
          {activeSection === 'assign' && (
            <div className="bg-cream-primary border border-brown-primary rounded-lg p-4 inline-block">
              <h2 className="text-2xl font-bold text-dark-brown mb-2">
                👨‍🔧 Inspector Assignment
              </h2>
            </div>
          )}
          
          {activeSection === 'status' && (
            <div className="bg-cream-primary border border-brown-primary rounded-lg p-4 inline-block">
              <h2 className="text-2xl font-bold text-dark-brown mb-2">
                📊 Assignment Status
              </h2>
            </div>
          )}
          
          {activeSection === 'history' && (
            <div className="bg-cream-primary border border-brown-primary rounded-lg p-4 inline-block">
              <h2 className="text-2xl font-bold text-dark-brown mb-2">
                📚 Assignment History
              </h2>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg border border-cream-light p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CSRDashboard;
