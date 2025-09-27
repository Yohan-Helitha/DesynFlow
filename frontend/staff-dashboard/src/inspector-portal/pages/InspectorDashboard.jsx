import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InspectorSidebar from '../components/InspectorSidebar';
import LocationManagement from '../components/LocationManagement';
import InspectionForm from './InspectionForm'; // Using existing InspectionForm
// Note: Using existing ReportList from finance-portal for reports

const InspectorDashboard = () => {
  const [activeSection, setActiveSection] = useState('location');
  const [inspector, setInspector] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch inspector profile
  const fetchInspector = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:4000/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInspector(response.data);
    } catch (error) {
      console.error('Error fetching inspector profile:', error);
    }
  };

  useEffect(() => {
    fetchInspector();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'location':
        return <LocationManagement inspector={inspector} setMessage={setMessage} />;
      case 'inspection':
        return <InspectionForm />;
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <span>📄</span>
                <span>Inspection Reports</span>
              </h2>
              <p className="text-gray-600 mt-1">View your inspection reports</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-blue-700">
                <strong>Note:</strong> Reports functionality will be integrated with existing report system.
                Your completed inspection forms will automatically generate reports.
              </p>
            </div>
          </div>
        );
      default:
        return <LocationManagement inspector={inspector} setMessage={setMessage} />;
    }
  };

  if (!inspector) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <InspectorSidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        onLogout={handleLogout}
        inspectorName={inspector.name}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Inspector Dashboard</h1>
          <p className="text-gray-600">Welcome back, {inspector.name}</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-blue-100 text-blue-700 border border-blue-300">
            {message}
          </div>
        )}

        {/* Dynamic Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InspectorDashboard;