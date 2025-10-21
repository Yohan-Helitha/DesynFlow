import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Budget_approval.css";

function Budget_approval() {
  const [budgetRequests, setBudgetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBudgetRequests();
  }, []);

  const fetchBudgetRequests = async () => {
    try {
      setLoading(true);
      // Fetch all purchase orders for procurement officers
      const response = await axios.get('/api/purchase-orders');
      const budgetOrders = response.data.filter(order => order.requestOrigin === 'BudgetApproval');
      setBudgetRequests(budgetOrders);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch budget requests:', err);
      setError('Failed to load budget requests');
      setLoading(false);
    }
  };

  const getStatusDisplayName = (status) => {
    switch(status) {
      case 'PendingFinanceApproval': return 'Processing';
      case 'Approved': return 'Approved';
      case 'Rejected': return 'Rejected';
      case 'Draft': return 'Draft';
      default: return status;
    }
  };

  const getStatusClassName = (status) => {
    switch(status) {
      case 'PendingFinanceApproval': return 'processing';
      case 'Approved': return 'approved';
      case 'Rejected': return 'rejected';
      case 'Draft': return 'draft';
      default: return 'processing';
    }
  };

  const filteredRequests = budgetRequests
    .filter(request => {
      const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (request.requesterName && request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const groupedRequests = {
    approved: filteredRequests.filter(req => req.status === 'Approved'),
    processing: filteredRequests.filter(req => req.status === 'PendingFinanceApproval'),
    rejected: filteredRequests.filter(req => req.status === 'Rejected'),
    draft: filteredRequests.filter(req => req.status === 'Draft')
  };

  if (loading) {
    return (
      <div className="budget-container">
        <div className="budget-header">
          <h2>Budget Approvals</h2>
        </div>
        <div className="loading-message">Loading budget requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="budget-container">
        <div className="budget-header">
          <h2>Budget Approvals</h2>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }
  return (
    <div className="budget-container">
        {/* Header */}
        <div className="budget-header">
          <h2>Budget Approvals</h2>
          <Link to="/procurement-officer/budget_approval_form">
            <button className="new-request-btn">+ New Budget Request</button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="budget-controls">
          <input
            type="text"
            placeholder="Search budget requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="PendingFinanceApproval">Processing</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Stats Summary */}
        <div className="budget-stats">
          <div className="stat-item">
            <span className="stat-number">{groupedRequests.approved.length}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{groupedRequests.processing.length}</span>
            <span className="stat-label">Processing</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{groupedRequests.rejected.length}</span>
            <span className="stat-label">Rejected</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{groupedRequests.draft.length}</span>
            <span className="stat-label">Draft</span>
          </div>
        </div>

        {/* Sections - Three Column Layout */}
        <div className="budget-sections">
          {/* Left Column - Approved */}
          <div className="budget-column">
            {groupedRequests.approved.length > 0 && (
              <div className="budget-section">
                <h3>✅ Approved ({groupedRequests.approved.length})</h3>
                {groupedRequests.approved.map((request) => (
                  <div key={request._id} className="budget-card approved">
                    <div>
                      <p className="title">{request.name}</p>
                      <p className="requester">By: {request.requesterName || 'Unknown'}</p>
                      <p className="amount">LKR {(request.totalAmount || 0).toLocaleString()}</p>
                      <p className="date">
                        {request.financeApproval?.approvedAt 
                          ? new Date(request.financeApproval.approvedAt).toLocaleDateString()
                          : new Date(request.createdAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                    <span className="status approved">Approved</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Middle Column - Processing & Rejected */}
          <div className="budget-column">
            {/* Processing Section */}
            {groupedRequests.processing.length > 0 && (
              <div className="budget-section">
                <h3>⏳ Processing ({groupedRequests.processing.length})</h3>
                {groupedRequests.processing.map((request) => (
                  <div key={request._id} className="budget-card processing">
                    <div>
                      <p className="title">{request.name}</p>
                      <p className="requester">By: {request.requesterName || 'Unknown'}</p>
                      <p className="amount">LKR {(request.totalAmount || 0).toLocaleString()}</p>
                      <p className="date">{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="status processing">Processing</span>
                  </div>
                ))}
              </div>
            )}

            {/* Rejected Section */}
            {groupedRequests.rejected.length > 0 && (
              <div className="budget-section">
                <h3>❌ Rejected ({groupedRequests.rejected.length})</h3>
                {groupedRequests.rejected.map((request) => (
                  <div key={request._id} className="budget-card rejected">
                    <div>
                      <p className="title">{request.name}</p>
                      <p className="requester">By: {request.requesterName || 'Unknown'}</p>
                      <p className="amount">LKR {(request.totalAmount || 0).toLocaleString()}</p>
                      <p className="date">
                        {request.financeApproval?.approvedAt 
                          ? new Date(request.financeApproval.approvedAt).toLocaleDateString()
                          : new Date(request.createdAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                    <span className="status rejected">Rejected</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Draft */}
          <div className="budget-column">
            {groupedRequests.draft.length > 0 && (
              <div className="budget-section">
                <h3>📝 Draft ({groupedRequests.draft.length})</h3>
                {groupedRequests.draft.map((request) => (
                  <div key={request._id} className="budget-card draft">
                    <div>
                      <p className="title">{request.name}</p>
                      <p className="requester">By: {request.requesterName || 'Unknown'}</p>
                      <p className="amount">LKR {(request.totalAmount || 0).toLocaleString()}</p>
                      <p className="date">{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="status draft">Draft</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="empty-state">
              <p>No budget requests found.</p>
              {searchTerm && <p>Try adjusting your search criteria.</p>}
            </div>
          )}
        </div>
    </div>
  );
}

export default Budget_approval;