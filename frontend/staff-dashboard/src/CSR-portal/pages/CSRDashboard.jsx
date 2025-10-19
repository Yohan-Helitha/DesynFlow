import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InspectionRequests from '../components/InspectionRequests';
import PaymentManagement from '../components/PaymentManagement';
import InspectorAssignment from '../components/InspectorAssignment';
import AssignmentStatusManager from '../components/AssignmentStatusManager';
import AssignmentHistory from '../components/AssignmentHistory';
import CSRSidebar from '../components/CSRSidebar';

const CSRDashboard = () => {
  const [activeSection, setActiveSection] = useState('requests');
  const [csr, setCsr] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch CSR profile and validate authentication
  const fetchCSR = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found - redirecting to login');
        handleLogout(); // This will redirect to login
        return;
      }

      const response = await axios.get('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Validate user role
      if (response.data.role !== 'customer service representative') {
        console.error('Access denied: User is not a CSR');
        alert('Access denied. This dashboard is for Customer Service Representatives only.');
        handleLogout();
        return;
      }
      
      setCsr(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching CSR profile:', error);
      if (error.response?.status === 401) {
        console.error('Authentication failed - token expired or invalid');
        handleLogout(); // Clear token and redirect to login
      } else {
        console.error('Failed to fetch CSR profile:', error.message);
        // For other errors, still redirect to login for security
        handleLogout();
      }
    }
  };

  useEffect(() => {
    fetchCSR();
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'requests':
        return <InspectionRequests csr={csr} onAuthError={handleLogout} />;
      case 'payments':
        return <PaymentManagement csr={csr} onAuthError={handleLogout} />;
      case 'assign':
        return <InspectorAssignment csr={csr} onAuthError={handleLogout} />;
      case 'status':
        return <AssignmentStatusManager csr={csr} onAuthError={handleLogout} />;
      case 'history':
        return <AssignmentHistory csr={csr} onAuthError={handleLogout} />;
      default:
        return <InspectionRequests csr={csr} onAuthError={handleLogout} />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading || !csr) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-primary mx-auto mb-4"></div>
          <p className="text-brown-primary">Loading CSR Dashboard...</p>
        </div>
      </div>
    );
  }

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
