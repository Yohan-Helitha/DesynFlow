import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LocationHistory = ({ inspector }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch location history for inspector
  const fetchLocationHistory = async () => {
    if (!inspector || (!inspector._id && !inspector.id)) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const inspectorId = inspector._id || inspector.id;
      
      // Fetch assignment history with inspection details
      const response = await axios.get(
        `/api/assignment/inspector/${inspectorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Transform data to include timing information
      const historyData = response.data.map(assignment => ({
        id: assignment._id,
        clientName: assignment.InspectionRequest_ID?.client_name || 'N/A',
        propertyAddress: assignment.InspectionRequest_ID?.property_full_address || 
          `${assignment.InspectionRequest_ID?.propertyLocation_address}, ${assignment.InspectionRequest_ID?.propertyLocation_city}`,
        propertyType: assignment.InspectionRequest_ID?.propertyType || 'N/A',
        assignedAt: assignment.assignAt,
        inspectionStartTime: assignment.inspection_start_time || null,
        inspectionEndTime: assignment.inspection_end_time || null,
        status: assignment.status,
        estimatedDuration: assignment.InspectionRequest_ID?.estimated_duration || 0
      }));
      
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching location history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationHistory();
  }, [inspector]);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600">Loading location history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-cream-primary rounded-lg p-4 border border-brown-primary-300">
        <h3 className="font-semibold text-brown-primary mb-2">📍 Location History</h3>
        <p className="text-brown-secondary">No inspection history found.</p>
      </div>
    );
  }

  return (
    <div className="bg-cream-primary rounded-lg p-4 border border-brown-primary-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-brown-primary">📍 Location History</h3>
        <button
          onClick={fetchLocationHistory}
          className="text-green-primary hover:text-soft-green text-sm font-medium"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((record) => (
          <LocationHistoryCard key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
};

const LocationHistoryCard = ({ record }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-primary text-cream-primary';
      case 'in-progress': return 'bg-soft-green text-brown-primary';
      case 'assigned': return 'bg-brown-primary-300 text-brown-primary';
      case 'cancelled': return 'bg-red-400 text-cream-primary';
      default: return 'bg-brown-secondary text-cream-primary';
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not started';
    return new Date(dateTime).toLocaleString();
  };

  const calculateDuration = () => {
    if (!record.inspectionStartTime || !record.inspectionEndTime) return null;
    const start = new Date(record.inspectionStartTime);
    const end = new Date(record.inspectionEndTime);
    const duration = Math.round((end - start) / (1000 * 60)); // minutes
    return duration;
  };

  const actualDuration = calculateDuration();

  return (
    <div className="bg-cream-secondary rounded-lg p-4 border border-brown-primary-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-brown-primary">{record.clientName}</h4>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
            {record.status.toUpperCase()}
          </span>
        </div>
        <div className="text-right text-sm text-brown-secondary">
          <p>📅 Assigned: {formatDateTime(record.assignedAt)}</p>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-sm font-medium text-brown-primary">🏠 Property Address:</p>
          <p className="text-sm text-brown-secondary">{record.propertyAddress}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-brown-primary">🏢 Property Type:</p>
          <p className="text-sm text-brown-secondary capitalize">{record.propertyType}</p>
        </div>
      </div>

      {/* Timing Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-cream-primary rounded p-3 border border-brown-primary-300">
        <div>
          <p className="text-xs font-medium text-brown-primary">⏰ Inspection Start:</p>
          <p className="text-sm text-brown-secondary">{formatDateTime(record.inspectionStartTime)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-brown-primary">⏹️ Inspection End:</p>
          <p className="text-sm text-brown-secondary">{formatDateTime(record.inspectionEndTime)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-brown-primary">⏱️ Duration:</p>
          <p className="text-sm text-brown-secondary">
            {actualDuration ? `${actualDuration} minutes` : 'In progress'}
            {record.estimatedDuration > 0 && (
              <span className="text-xs text-brown-secondary opacity-75 block">
                (Est: {record.estimatedDuration} min)
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationHistory;
