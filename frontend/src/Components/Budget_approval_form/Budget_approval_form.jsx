import React from 'react';
import './Budget_approval_form.css';
import Sidebar from "../Sidebar/Sidebar";

function Budget_approval_form() {
  // handle form submit
  function handleSubmit(e) {
    e.preventDefault();

    const materialId = document.getElementById('materialId').value.trim();
    const materialName = document.getElementById('materialName').value.trim();
    const quantity = document.getElementById('quantity').value.trim();
    const supplierName = document.getElementById('supplierName').value.trim();
    const supplierId = document.getElementById('supplierId').value.trim();
    const budget = document.getElementById('budget').value.trim();

    if (!materialId || !materialName || !quantity || !supplierName || !supplierId || !budget) {
      alert('⚠️ Please fill in all fields before submitting.');
      return;
    }

    if (quantity <= 0 || budget <= 0) {
      alert('⚠️ Quantity and Budget must be greater than 0.');
      return;
    }

    alert('✅ Budget Approval Request Submitted Successfully!');
    e.target.reset();
  }

  function handleCancel() {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      document.querySelector('.budget-form').reset();
    }
  }

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="form-wrapper">
        <form className="budget-form" onSubmit={handleSubmit}>
          <h2>Budget Approval Request</h2>

        <div className="form-group">
          <label htmlFor="materialId">Material ID</label>
          <input type="text" id="materialId" placeholder="Enter Material ID" />
        </div>

        <div className="form-group">
          <label htmlFor="materialName">Material Name</label>
          <input type="text" id="materialName" placeholder="Enter Material Name" />
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input type="number" id="quantity" placeholder="Enter Quantity" />
        </div>

        <div className="form-group">
          <label htmlFor="supplierName">Supplier Name</label>
          <input type="text" id="supplierName" placeholder="Enter Supplier Name" />
        </div>

        <div className="form-group">
          <label htmlFor="supplierId">Supplier ID</label>
          <input type="text" id="supplierId" placeholder="Enter Supplier ID" />
        </div>

        <div className="form-group">
          <label htmlFor="budget">Estimated Budget (LKR)</label>
          <input type="number" id="budget" placeholder="Enter Amount in LKR" />
        </div>

        <div className="form-buttons">
          <button type="submit" className="forward-btn">Forward to Finance Dept.</button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
      </div>
    </div>
  );
}

export default Budget_approval_form;