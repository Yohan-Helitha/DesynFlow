import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InspectorSidebar from '../components/InspectorSidebar';
import LocationManagement from '../components/LocationManagement';
import AssignedJobs from '../components/AssignedJobs';
import DynamicInspectionForm from './DynamicInspectionForm'; // Use dynamic form for all cases
import InspectorReports from '../components/InspectorReports';
import NotificationSystem from '../../components/NotificationSystem';
import socketService from '../../services/socketService';

const InspectorDashboard = () => {
  const [activeSection, setActiveSection] = useState('location');
  const [inspector, setInspector] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Fetch inspector profile
  const fetchInspector = async () => {
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
      if (response.data.role !== 'inspector') {
        console.error('Access denied: User is not an inspector');
        alert('Access denied. This dashboard is for inspectors only.');
        handleLogout();
        return;
      }
      
      setInspector(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inspector profile:', error);
      if (error.response?.status === 401) {
        console.error('Authentication failed - token expired or invalid');
        handleLogout(); // Clear token and redirect to login
      } else {
        console.error('Failed to fetch inspector profile:', error.message);
        // For other errors, still redirect to login for security
        handleLogout();
      }
    }
  };

  useEffect(() => {
    fetchInspector();
  }, []);

  // Setup real-time notifications
  useEffect(() => {
    if (inspector) {
      // Connect to WebSocket
      socketService.connect(inspector._id, inspector.role);
      socketService.joinRoom('inspector', inspector._id);

      // Listen for new assignment notifications
      socketService.onAssignmentCreated((data) => {
        console.log('New assignment notification:', data);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'new_assignment',
          ...data
        }]);
      });

      // Listen for assignment updates
      socketService.onAssignmentUpdated((data) => {
        console.log('Assignment updated notification:', data);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'assignment_updated',
          ...data
        }]);
      });

      // Cleanup on unmount
      return () => {
        socketService.leaveRoom('inspector', inspector._id);
        socketService.disconnect();
      };
    }
  }, [inspector]);

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Handle "Collect Data" button click from assignments
  const handleCollectData = (assignment) => {
    setSelectedAssignment(assignment);
    setActiveSection('inspection');
    setMessage(`📝 Collecting data for: ${assignment.inspectionRequest?.clientName || 'Assignment'}`);
  };

  // Handle navigation back to standalone form management
  const handleBackToForms = () => {
    setSelectedAssignment(null);
    setActiveSection('inspection');
    setMessage('');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'location':
        return <LocationManagement inspector={inspector} setMessage={setMessage} />;
      case 'assignments':
        return <AssignedJobs inspector={inspector} onCollectData={handleCollectData} />;
      case 'inspection':
        // Always use DynamicInspectionForm, but pass selectedAssignment (can be null for standalone)
        return <DynamicInspectionForm selectedAssignment={selectedAssignment} />;
      case 'reports':
        return <InspectorReports />;
      default:
        return <LocationManagement inspector={inspector} setMessage={setMessage} />;
    }
  };

  if (loading || !inspector) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-primary mx-auto mb-4"></div>
          <p className="text-brown-primary">Loading Inspector Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cream-primary">
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
          <h1 className="text-3xl font-bold text-brown-primary">Inspector Dashboard</h1>
          <p className="text-brown-secondary">Welcome back, {inspector.name}</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-primary text-cream-primary border border-soft-green">
            {message}
          </div>
        )}

        {/* Dynamic Content */}
        <div className="bg-cream-primary rounded-lg shadow-lg p-6 border border-brown-primary-300">
          {renderContent()}
        </div>
      </div>

      {/* Notification System */}
      {notifications.map((notification) => (
        <NotificationSystem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default InspectorDashboard;

