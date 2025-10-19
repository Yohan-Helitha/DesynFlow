import React, { useState, useEffect } from 'react';
import './Restock_alerts.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes, FaClipboardList, FaExclamationTriangle, FaBox, FaClock, FaArrowUp, FaCheckCircle, FaWarehouse, FaUser, FaCalendarAlt } from 'react-icons/fa';
import Sidebar from '../Sidebar/Sidebar';
// Use existing service to fetch reorder requests
import { fetchSReorderRequests } from '../../../warehouse-manager/services/FsReorderRequestService.js';

function RestockAlerts() {
  const navigate = useNavigate();
  const [reorderRequests, setReorderRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Helper function to get status priority for sorting and filtering
  const getStatusPriority = (status) => {
    switch (status?.toLowerCase()) {
      case 'urgent': return 'critical';
      case 'pending': return 'high';
      case 'approved': return 'medium';
      case 'completed': return 'low';
      default: return 'medium';
    }
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to check if request is overdue
  const isOverdue = (expectedDate) => {
    if (!expectedDate) return false;
    return new Date(expectedDate) < new Date();
  };

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const loadReorderRequests = async () => {
      try {
        setLoading(true);
        const data = await fetchSReorderRequests();
        if (!isMounted) return;
        
        // Sort by creation date (newest first) and add priority based on status and dates
        const processedData = Array.isArray(data) ? data
          .map(request => ({
            ...request,
            priority: getStatusPriority(request.status),
            isOverdue: isOverdue(request.expectedDate)
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
        
        setReorderRequests(processedData);
        setFilteredRequests(processedData);
      } catch (e) {
        console.error('Failed to load reorder requests', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadReorderRequests();
    // Poll every 30s for dynamic updates
    intervalId = setInterval(loadReorderRequests, 30000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Filter requests based on search and status
  useEffect(() => {
    let filtered = reorderRequests;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        (request.materialName || '').toLowerCase().includes(term) ||
        (request.inventoryName || '').toLowerCase().includes(term) ||
        (request.warehouseManagerName || '').toLowerCase().includes(term) ||
        (request.stockReorderRequestId || '').toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, reorderRequests]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <FaClock />;
      case 'approved': return <FaCheckCircle />;
      case 'completed': return <FaBox />;
      case 'urgent': return <FaExclamationTriangle />;
      default: return <FaClock />;
    }
  };

  const getStatusClass = (status, isOverdue) => {
    if (isOverdue) return 'status-overdue';
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'completed': return 'status-completed';
      case 'urgent': return 'status-urgent';
      default: return 'status-pending';
    }
  };

  const getDaysUntilExpected = (expectedDate) => {
    if (!expectedDate) return null;
    const days = Math.ceil((new Date(expectedDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleCreateOrder = (request) => {
    // Navigate to the existing Order Form route and pass context for potential prefill
    navigate('/procurement-officer/order_form', {
      state: {
        fromReorderRequest: true,
        recommended: {
          materialName: request.materialName,
          quantity: request.quantity,
          requestId: request.stockReorderRequestId,
          inventoryName: request.inventoryName
        }
      }
    });
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  if (loading) {
    return (
      <div className="page-with-sidebar">
        <Sidebar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading restock alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="restock-alerts-container">
        <div className="page-header">
          <div className="header-content">
            <h2><FaWarehouse /> Reorder Requests</h2>
          </div>
          <div className="header-stats">
            <div className="stat-card pending">
              <span className="stat-number">{reorderRequests.filter(r => r.status?.toLowerCase() === 'pending').length}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card urgent">
              <span className="stat-number">{reorderRequests.filter(r => r.isOverdue).length}</span>
              <span className="stat-label">Overdue</span>
            </div>
            <div className="stat-card total">
              <span className="stat-number">{reorderRequests.length}</span>
              <span className="stat-label">Total Requests</span>
            </div>
          </div>
        </div>

        <div className="controls-section">
          <div className="search-filter-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by material, warehouse, manager, or request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="status-filter">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Material</th>
                <th>Inventory Location</th>
                <th>Quantity</th>
                <th>Type & Unit</th>
                <th>Expected Date</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request._id} className={`request-row ${getStatusClass(request.status, request.isOverdue)}`}>
                    <td>
                      <div className="request-id-cell">
                        <span className="request-id">{request.stockReorderRequestId}</span>
                        {request.isOverdue && <FaExclamationTriangle className="overdue-icon" title="Overdue" />}
                      </div>
                    </td>
                    <td>
                      <div className="material-info">
                        <span className="material-name">{request.materialName}</span>
                        <span className="material-id">ID: {request.materialId}</span>
                      </div>
                    </td>
                    <td>
                      <div className="inventory-info">
                        <span className="inventory-name">{request.inventoryName}</span>
                        <span className="inventory-address">{request.inventoryAddress}</span>
                      </div>
                    </td>
                    <td>
                      <span className="quantity-number">{request.quantity}</span>
                    </td>
                    <td>
                      <div className="type-unit-info">
                        <span className="type">{request.type}</span>
                        <span className="unit">({request.unit})</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className={`expected-date ${request.isOverdue ? 'overdue' : ''}`}>
                          {formatDate(request.expectedDate)}
                        </span>
                        {getDaysUntilExpected(request.expectedDate) !== null && (
                          <span className={`days-info ${getDaysUntilExpected(request.expectedDate) < 0 ? 'overdue' : 'upcoming'}`}>
                            {getDaysUntilExpected(request.expectedDate) < 0 
                              ? `${Math.abs(getDaysUntilExpected(request.expectedDate))} days overdue`
                              : `${getDaysUntilExpected(request.expectedDate)} days left`
                            }
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="manager-info">
                        <FaUser className="manager-icon" />
                        <span>{request.warehouseManagerName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span className={`status-badge ${getStatusClass(request.status, request.isOverdue)}`}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="created-date">{formatDate(request.createdAt)}</span>
                    </td>
                    <td>
                      <div className="action-buttons-table">
                        <button
                          className="btn-create-order"
                          onClick={() => handleCreateOrder(request)}
                          title="Create Order"
                        >
                          Create Order
                        </button>
                        <button
                          className="btn-view-details"
                          onClick={() => handleViewDetails(request)}
                          title="View Details"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-requests">
                    <div className="empty-state">
                      <FaBox className="empty-icon" />
                      <p>No reorder requests found</p>
                      <small>No active reorder requests match your current filters</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>



        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Reorder Request Details - {selectedRequest.stockReorderRequestId}</h3>
                <button className="close-btn" onClick={() => setSelectedRequest(null)}><FaTimes /></button>
              </div>
              
              <div className="modal-body">
                <div className="details-grid">
                  <div className="detail-section">
                    <h4><FaBox /> Material Information</h4>
                    <div className="detail-item">
                      <span>Material Name:</span>
                      <span className="highlight">{selectedRequest.materialName}</span>
                    </div>
                    <div className="detail-item">
                      <span>Material ID:</span>
                      <span>{selectedRequest.materialId}</span>
                    </div>
                    <div className="detail-item">
                      <span>Quantity Requested:</span>
                      <span className="quantity">{selectedRequest.quantity} {selectedRequest.unit}</span>
                    </div>
                    <div className="detail-item">
                      <span>Type:</span>
                      <span>{selectedRequest.type}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4><FaWarehouse /> Inventory Information</h4>
                    <div className="detail-item">
                      <span>Inventory Name:</span>
                      <span>{selectedRequest.inventoryName}</span>
                    </div>
                    <div className="detail-item">
                      <span>Location ID:</span>
                      <span>{selectedRequest.inventoryId}</span>
                    </div>
                    <div className="detail-item">
                      <span>Address:</span>
                      <span>{selectedRequest.inventoryAddress}</span>
                    </div>
                    <div className="detail-item">
                      <span>Contact:</span>
                      <span>{selectedRequest.inventoryContact}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4><FaCalendarAlt /> Timeline & Management</h4>
                    <div className="detail-item">
                      <span>Expected Date:</span>
                      <span className={`expected-date ${selectedRequest.isOverdue ? 'overdue' : ''}`}>
                        {formatDate(selectedRequest.expectedDate)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>Created Date:</span>
                      <span>{formatDate(selectedRequest.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Warehouse Manager:</span>
                      <span><FaUser /> {selectedRequest.warehouseManagerName}</span>
                    </div>
                    <div className="detail-item">
                      <span>Status:</span>
                      <span className={`status-badge ${getStatusClass(selectedRequest.status, selectedRequest.isOverdue)}`}>
                        {getStatusIcon(selectedRequest.status)}
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedRequest.isOverdue && (
                  <div className="alert-banner overdue">
                    <FaExclamationTriangle />
                    <span>This request is overdue by {Math.abs(getDaysUntilExpected(selectedRequest.expectedDate))} days</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    handleCreateOrder(selectedRequest);
                    setSelectedRequest(null);
                  }}
                >
                  <FaClipboardList /> Create Purchase Order
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestockAlerts;