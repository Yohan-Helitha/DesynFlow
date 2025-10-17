import React, { useState, useEffect } from 'react';
import './Restock_alerts.css';
import { Link, useNavigate } from 'react-router-dom';
// Removed toast import as it is no longer used
import { FaTimes, FaClipboardList, FaExclamationTriangle, FaBox, FaClock, FaArrowUp } from 'react-icons/fa';
import Sidebar from '../Sidebar/Sidebar';
// Use existing service used by warehouse pages to fetch threshold alerts
import { fetchThresholdAlerts } from '../../../warehouse-manager/services/FthresholdAlertService.js';
import { FaCheckCircle } from 'react-icons/fa';

function RestockAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Map backend threshold alerts to this UI's shape
  const mapToUiAlert = (ta) => {
    const current = Number(ta.currentLevel ?? 0);
    const min = Number(ta.restockLevel ?? 0);
    const ratio = min > 0 ? current / min : 0;
    let priority = 'low';
    if (ratio <= 0.25) priority = 'critical';
    else if (ratio <= 0.5) priority = 'high';
    else if (ratio <= 0.8) priority = 'medium';

    const suggested = Math.max(min - current, 0);

    return {
      id: ta.alertId || ta._id,
      docId: ta._id, // keep original _id for API operations like delete
      materialName: ta.materialName || 'Unknown material',
      category: ta.category || '-',
      currentStock: current,
      minThreshold: min,
      maxThreshold: ta.maxThreshold || min * 3 || 0,
      priority,
      supplier: ta.supplier || '-',
      estimatedRunOut: '-',
      suggestedReorder: suggested,
      unitPrice: ta.unitPrice || 0,
      avgConsumption: ta.avgConsumption || 0,
      lastOrderDate: ta.alertDate ? new Date(ta.alertDate).toLocaleDateString() : '-',
      location: ta.inventoryName || '-'
    };
  };

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchThresholdAlerts();
        if (!isMounted) return;
        const mapped = Array.isArray(data) ? data.map(mapToUiAlert) : [];
        setAlerts(mapped);
        setFilteredAlerts(mapped);
      } catch (e) {
        console.error('Failed to load threshold alerts', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    // Poll every 20s for dynamic updates
    intervalId = setInterval(load, 20000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Filter alerts based on search and priority
  useEffect(() => {
    let filtered = alerts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(alert => 
        (alert.materialName || '').toLowerCase().includes(term) ||
        (alert.category || '').toLowerCase().includes(term) ||
        (alert.supplier || '').toLowerCase().includes(term)
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
    if (!min || min <= 0) return 0;
    return Math.max(0, Math.min(100, ((current / min) * 100))).toFixed(0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCreateOrder = (alert) => {
    // Navigate to the existing Order Form route and pass context for potential prefill
    navigate('/procurement-officer/order_form', {
      state: {
        fromRestockAlert: true,
        recommended: {
          materialName: alert.materialName,
          suggestedReorder: alert.suggestedReorder,
          unitPrice: alert.unitPrice,
          priority: alert.priority
        }
      }
    });
  };

  const handleMarkResolved = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleMarkReceived = async (alert) => {
    try {
      // Use the existing delete API as a resolution/acknowledge action
    } catch (err) {
      console.error('Failed to mark as received:', err);
      toast.error('Failed to mark as received. Please try again.');
    }
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
            <h2><FaExclamationTriangle /> Restock Alerts</h2>
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
                        {/* Mark as Received button intentionally not shown here; handled in Orders page */}
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