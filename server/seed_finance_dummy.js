// Dummy data seeder for all finance models
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { User } from './modules/finance/model/user.js';
import { Project } from './modules/finance/model/project.js';
import InspectionRequest from './modules/finance/model/inspection_request.js';
import Material from './modules/finance/model/material.js';
import PurchaseOrder from './modules/finance/model/purchase_order.js';
import QuotationEstimation from './modules/finance/model/quotation_estimation.js';
import Payment from './modules/finance/model/payment.js';
import Expense from './modules/finance/model/expenses.js';
import Warranty from './modules/finance/model/warrenty.js';
import WarrantyClaim from './modules/finance/model/warrenty_claim.js';
import ProjectEstimation from './modules/finance/model/project_estimation.js';
import Notification from './modules/finance/model/notification.js';
import FinanceSummary from './modules/finance/model/finance_summary.js';
import InspectionEstimate from './modules/finance/model/inspection_estimation.js';
import PurchaseApproval from './modules/finance/model/purchase_approval.js';
import SupplierMaterialCatalog from './modules/finance/model/supplier_material_catalog.js';

async function seed() {
  await mongoose.connect(env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Clear all collections first
  const models = [User, Project, InspectionRequest, Material, PurchaseOrder, QuotationEstimation, Payment, Expense, Warranty, WarrantyClaim, ProjectEstimation, Notification, FinanceSummary, InspectionEstimate, PurchaseApproval, SupplierMaterialCatalog];
  for (const model of models) {
    await model.deleteMany({});
  }

  // 1. Users
  const users = await User.insertMany(Array.from({length: 10}, (_,i) => ({
    name: `User${i+1}`,
    email: `user${i+1}@example.com`
  })));

  // 2. Materials
  const materials = await Material.insertMany(Array.from({length: 10}, (_,i) => ({
    materialId: `MAT-${i+1}`,
    materialName: `Material ${i+1}`,
    category: i%2===0 ? 'Steel' : 'Concrete',
    type: i%2===0 ? 'Beam' : 'Slab',
    unit: 'pcs',
    warrantyPeriod: `${12+i} months`
  })));

  // 3. Inspection Requests
  const inspections = await InspectionRequest.insertMany(Array.from({length: 10}, (_,i) => {
    const _id = new mongoose.Types.ObjectId();
    return {
      _id,
      inspectionRequestId: _id,
      clientId: users[i%users.length]._id,
      clientName: users[i%users.length].name,
      email: users[i%users.length].email,
      phone: `07100000${i}`,
      siteLocation: `Site ${i+1}`,
      propertyType: ['House','Hotel','Office','Other'][i%4],
      floors: [1,2,3],
      status: ['Pending','PaymentPending','Assigned','Completed'][i%4],
      assignedInspectorId: users[(i+1)%users.length]._id,
      paymentReceiptUrl: `http://example.com/receipt${i}.pdf`
    };
  }));

  // 4. Projects
  const projects = await Project.insertMany(Array.from({length: 10}, (_,i) => ({
    projectName: `Project ${i+1}`,
    inspectionId: inspections[i]._id,
    projectManagerId: users[(i+2)%users.length]._id,
    clientId: users[i%users.length]._id,
    assignedTeamId: null,
    status: ['Active','In Progress','Completed','On Hold','Cancelled'][i%5],
    progress: Math.floor(Math.random()*100),
    finalDesign3DUrl: `http://example.com/design${i}.pdf`,
    designAccessRestriction: i%2===0,
    estimateCreated: i%2===0
  })));

  // 5. Purchase Orders
  const purchaseOrders = await PurchaseOrder.insertMany(Array.from({length: 10}, (_,i) => ({
    requestOrigin: ['Manual','ReorderAlert','ProjectMR'][i%3],
    projectId: projects[i]._id,
    supplierId: null,
    requestedBy: users[i%users.length]._id,
    status: ['Draft','PendingFinanceApproval','Approved','Rejected','SentToSupplier','InProgress','Delivered','Closed'][i%8],
    items: [{
      materialId: materials[i%materials.length]._id,
      description: `Material for PO${i+1}`,
      quantity: 10+i,
      unitPrice: 100+i*10,
      total: (10+i)*(100+i*10)
    }],
    totalAmount: (10+i)*(100+i*10),
    financeApproval: {
      approverId: users[(i+3)%users.length]._id,
      status: ['Pending','Approved','Rejected'][i%3],
      note: `Approval note ${i+1}`,
      approvedAt: new Date()
    }
  })));

  // 6. Quotation Estimations
  const quotations = await QuotationEstimation.insertMany(Array.from({length: 10}, (_,i) => ({
    projectId: projects[i]._id,
    estimateVersion: 1,
    version: i+1,
    status: ['Draft','Sent','Revised','Confirmed','Locked'][i%5],
    locked: i%2===0,
    remarks: `Remark ${i+1}`,
    createdBy: users[i%users.length]._id,
    updatedBy: users[(i+1)%users.length]._id,
    sentTo: users[(i+2)%users.length]._id,
    sentAt: new Date(),
    fileUrl: `http://example.com/quotation${i}.pdf`,
    laborItems: [{task: 'Task', hours: 10, rate: 20, total: 200}],
    materialItems: [{materialId: materials[i%materials.length]._id, description: 'Desc', quantity: 5, unitPrice: 50, total: 250}],
    serviceItems: [{service: 'Service', cost: 100}],
    contingencyItems: [{description: 'Misc', amount: 50}],
    taxes: [{description: 'VAT', percentage: 15, amount: 75}],
    subtotal: 450,
    totalContingency: 50,
    totalTax: 75,
    grandTotal: 575
  })));

  // 7. Payments
  const payments = await Payment.insertMany(Array.from({length: 10}, (_,i) => ({
    projectId: projects[i]._id,
    clientId: users[i%users.length]._id,
    amount: 1000+i*100,
    method: ['Bank','Online','Cash'][i%3],
    type: ['InspectionCost','ProjectPayment','Advance'][i%3],
    receiptUrl: `http://example.com/receipt${i}.pdf`,
    status: ['Pending','Approved','Rejected'][i%3],
    comment: `Payment comment ${i+1}`,
    verifiedBy: users[(i+4)%users.length]._id
  })));

  // 8. Expenses
  const expenses = await Expense.insertMany(Array.from({length: 10}, (_,i) => ({
    projectId: projects[i]._id,
    category: ['Labor','Procurement','Transport','Misc'][i%4],
    amount: 100+i*10,
    description: `Expense ${i+1}`,
    createdBy: users[i%users.length]._id,
    proof: `http://example.com/proof${i}.pdf`
  })));

  // 9. Warranties
  const warranties = await Warranty.insertMany(Array.from({length: 10}, (_,i) => ({
    projectId: projects[i]._id,
    clientId: users[i%users.length]._id,
    itemId: materials[i%materials.length]._id,
    warrantyStart: new Date(),
    warrantyEnd: new Date(Date.now() + 1000*60*60*24*365),
    status: ['Active','Expired','Claimed','Replaced'][i%4]
  })));

  // 10. Warranty Claims
  const warrantyClaims = await WarrantyClaim.insertMany(Array.from({length: 10}, (_,i) => ({
    warrantyId: warranties[i]._id,
    clientId: users[i%users.length]._id,
    issueDescription: `Issue ${i+1}`,
    status: ['Submitted','UnderReview','Approved','Rejected','Replaced'][i%5],
    financeReviewerId: users[(i+5)%users.length]._id,
    warehouseAction: {
      shippedReplacement: i%2===0,
      shippedAt: new Date()
    }
  })));

  // 11. Project Estimations
  const projectEstimations = await ProjectEstimation.insertMany(Array.from({length: 10}, (_,i) => ({
    projectId: projects[i]._id,
    version: i+1,
    laborCost: 100+i*10,
    materialCost: 200+i*10,
    serviceCost: 50+i*5,
    contingencyCost: 20+i*2,
    total: 370+i*27,
    createdBy: users[i%users.length]._id,
    status: ['Pending','Approved','Rejected'][i%3]
  })));

  // 12. Notifications
  const notifications = await Notification.insertMany(Array.from({length: 10}, (_,i) => ({
    userId: users[i%users.length]._id,
    message: `Notification ${i+1}`,
    type: ['Info','Warning','Alert'][i%3],
    read: i%2===0
  })));

  // 13. Finance Summaries
  await FinanceSummary.insertMany(Array.from({length: 10}, (_,i) => ({
    totalIncome: 10000+i*1000,
    totalBalance: 5000+i*500
  })));

  // 14. Inspection Estimates
  await InspectionEstimate.insertMany(Array.from({length: 10}, (_,i) => ({
    inspectionRequestId: inspections[i]._id,
    distanceKm: 10+i,
    estimatedCost: 1000+i*100,
    createdBy: users[i%users.length]._id
  })));

  // 15. Purchase Approvals
  await PurchaseApproval.insertMany(Array.from({length: 10}, (_,i) => ({
    purchaseOrderId: purchaseOrders[i]._id,
    approverId: users[i%users.length]._id,
    status: ['Pending','Approved','Rejected'][i%3],
    note: `Approval note ${i+1}`,
    decidedAt: new Date()
  })));

  // 16. SupplierMaterialCatalog (requires Supplier model, which is empty)
  // Skipped due to missing Supplier schema

  console.log('Dummy data seeded for all models!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
