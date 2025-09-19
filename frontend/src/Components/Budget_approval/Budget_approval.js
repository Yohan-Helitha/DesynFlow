import React from "react";
import "./Budget_approval.css";

function Budget_approval() {
  return (
    <div className="budget-container">
      {/* Header */}
      <div className="budget-header">
        <h2>Budget Approvals</h2>
        <button className="new-request-btn">+ New Budget Request</button>
      </div>

      {/* Sections */}
      <div className="budget-sections">
        {/* Approved Section */}
        <div className="budget-section">
          <h3>✅ Approved</h3>
          <div className="budget-card approved">
            <div>
              <p className="title">Office Renovation</p>
              <p className="amount">LKR 25,000</p>
            </div>
            <span className="status approved">Approved</span>
          </div>

          <div className="budget-card approved">
            <div>
              <p className="title">Marketing Campaign</p>
              <p className="amount">LKR 10,500</p>
            </div>
            <span className="status approved">Approved</span>
          </div>
        </div>

        {/* Processing Section */}
        <div className="budget-section">
          <h3>⏳ Processing</h3>
          <div className="budget-card processing">
            <div>
              <p className="title">New IT Equipment</p>
              <p className="amount">LKR 15,200</p>
            </div>
            <span className="status processing">Processing</span>
          </div>

          <div className="budget-card processing">
            <div>
              <p className="title">Training Programs</p>
              <p className="amount">LKR 5,800</p>
            </div>
            <span className="status processing">Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Budget_approval;