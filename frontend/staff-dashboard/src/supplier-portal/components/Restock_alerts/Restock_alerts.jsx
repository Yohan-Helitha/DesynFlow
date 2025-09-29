import React, { useState, useEffect } from 'react';
import './Restock_alerts.css';
import { Link } from 'react-router-dom';
import { FaTimes, FaClipboardList } from 'react-icons/fa';
import Sidebar from '../Sidebar/Sidebar';

function RestockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    // Initialize with empty alerts - data would come from API in real implementation
    const fetchAlerts = async () => {
      setLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        setAlerts([]);
        setFilteredAlerts([]);
        setLoading(false);
      }, 1000);
    };

    fetchAlerts();
  }, []);

  // Filter alerts based on search and priority
  useEffect(() => {
    let filtered = alerts;

    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.priority === priorityFilter);
    }

    setFilteredAlerts(filtered);
  }, [searchTerm, priorityFilter, alerts]);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return '●';
      case 'high': return '●';
      case 'medium': return '●';
      case 'low': return '●';
      default: return '●';
    }
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  const getStockPercentage = (current, min) => {
    return ((current / min) * 100).toFixed(0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCreateOrder = (alert) => {
    // This would navigate to order form with pre-filled data
    console.log('Creating order for:', alert);
  };

  const handleMarkResolved = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
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
            <h2>Restock Alerts</h2>
            <p className="header-subtitle">Inventory Management & Restocking Overview</p>
          </div>
          <div className="header-stats">
            <div className="stat-card critical">
              <span className="stat-number">{alerts.filter(a => a.priority === 'critical').length}</span>
              <span className="stat-label">Critical</span>
            </div>
            <div className="stat-card high">
              <span className="stat-number">{alerts.filter(a => a.priority === 'high').length}</span>
              <span className="stat-label">High Priority</span>
            </div>
            <div className="stat-card total">
              <span className="stat-number">{alerts.length}</span>
              <span className="stat-label">Total Alerts</span>
            </div>
          </div>
        </div>

        <div className="controls-section">
          <div className="search-filter-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by material, category, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="priority-filter">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="alerts-table-container">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Material</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min. Threshold</th>
                <th>Stock Level</th>
                <th>Supplier</th>
                <th>Est. Run Out</th>
                <th>Suggested Reorder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className={`alert-row ${getPriorityClass(alert.priority)}`}>
                    <td>
                      <div className="priority-cell">
                        <span className={`priority-dot priority-${alert.priority}`}>{getPriorityIcon(alert.priority)}</span>
                        <span className="priority-text">{alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="material-info">
                        <span className="material-name">{alert.materialName}</span>
                        <span className="alert-id">#{alert.id}</span>
                      </div>
                    </td>
                    <td>{alert.category}</td>
                    <td><span className="stock-number">{alert.currentStock}</span></td>
                    <td><span className="threshold-number">{alert.minThreshold}</span></td>
                    <td>
                      <div className="stock-level-cell">
                        <div className="progress-bar-small">
                          <div 
                            className={`progress-fill-small priority-${alert.priority}`}
                            style={{ width: `${Math.min(getStockPercentage(alert.currentStock, alert.minThreshold), 100)}%` }}
                          ></div>
                        </div>
                        <span className="progress-percentage">{getStockPercentage(alert.currentStock, alert.minThreshold)}%</span>
                      </div>
                    </td>
                    <td>{alert.supplier}</td>
                    <td><span className="run-out-date">{alert.estimatedRunOut}</span></td>
                    <td>
                      <div className="reorder-info">
                        <span className="reorder-qty">{alert.suggestedReorder} units</span>
                        <span className="reorder-cost">${(alert.suggestedReorder * alert.unitPrice).toFixed(2)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons-table">
                        <button
                          className="btn-create-order"
                          onClick={() => handleCreateOrder(alert)}
                          title="Create Order"
                        >
                          Create Order
                        </button>
                        <button
                          className="btn-view-details"
                          onClick={() => setSelectedAlert(alert)}
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
                  <td colSpan="10" className="no-alerts">
                    <div className="empty-state">
                      <p>No restock alerts at this time</p>
                      <small>All inventory levels are within acceptable ranges</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>



        {/* Alert Details Modal */}
        {selectedAlert && (
          <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Alert Details - {selectedAlert.materialName}</h3>
                <button className="close-btn" onClick={() => setSelectedAlert(null)}><FaTimes /></button>
              </div>
              
              <div className="modal-body">
                <div className="details-grid">
                  <div className="detail-section">
                    <h4>Stock Information</h4>
                    <div className="detail-item">
                      <span>Current Stock:</span>
                      <span>{selectedAlert.currentStock} units</span>
                    </div>
                    <div className="detail-item">
                      <span>Minimum Threshold:</span>
                      <span>{selectedAlert.minThreshold} units</span>
                    </div>
                    <div className="detail-item">
                      <span>Maximum Threshold:</span>
                      <span>{selectedAlert.maxThreshold} units</span>
                    </div>
                    <div className="detail-item">
                      <span>Average Consumption:</span>
                      <span>{selectedAlert.avgConsumption} units/week</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Supplier Information</h4>
                    <div className="detail-item">
                      <span>Supplier:</span>
                      <span>{selectedAlert.supplier}</span>
                    </div>
                    <div className="detail-item">
                      <span>Last Order Date:</span>
                      <span>{selectedAlert.lastOrderDate}</span>
                    </div>
                    <div className="detail-item">
                      <span>Unit Price:</span>
                      <span>{formatCurrency(selectedAlert.unitPrice)}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Reorder Recommendation</h4>
                    <div className="detail-item">
                      <span>Suggested Quantity:</span>
                      <span className="highlight">{selectedAlert.suggestedReorder} units</span>
                    </div>
                    <div className="detail-item">
                      <span>Estimated Total Cost:</span>
                      <span className="cost">{formatCurrency(selectedAlert.suggestedReorder * selectedAlert.unitPrice)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Estimated Run Out:</span>
                      <span className="urgency">{selectedAlert.estimatedRunOut}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    handleCreateOrder(selectedAlert);
                    setSelectedAlert(null);
                  }}
                >
                  <FaClipboardList /> Create Purchase Order
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedAlert(null)}
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