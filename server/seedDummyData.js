import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InspectionRequest from './modules/finance/model/inspection_request.js';
import ProjectEstimation from './modules/finance/model/project_estimation.js';
import Payment from './modules/finance/model/payment.js';
import QuotationEstimation from './modules/finance/model/quotation_estimation.js';
import Expense from './modules/finance/model/expenses.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/desynflow';

async function seed() {
  await mongoose.connect(MONGO_URI);

  // InspectionRequest
  await InspectionRequest.deleteMany({});
  await InspectionRequest.insertMany([
    { inspectionRequestId: new mongoose.Types.ObjectId(), clientId: new mongoose.Types.ObjectId(), clientName: 'Alice', email: 'alice@example.com', phone: '1234567890', siteLocation: 'Colombo', propertyType: 'House', status: 'Pending' },
    { inspectionRequestId: new mongoose.Types.ObjectId(), clientId: new mongoose.Types.ObjectId(), clientName: 'Bob', email: 'bob@example.com', phone: '2345678901', siteLocation: 'Kandy', propertyType: 'Hotel', status: 'PaymentPending' },
    { inspectionRequestId: new mongoose.Types.ObjectId(), clientId: new mongoose.Types.ObjectId(), clientName: 'Charlie', email: 'charlie@example.com', phone: '3456789012', siteLocation: 'Galle', propertyType: 'Office', status: 'Assigned' },
    { inspectionRequestId: new mongoose.Types.ObjectId(), clientId: new mongoose.Types.ObjectId(), clientName: 'Diana', email: 'diana@example.com', phone: '4567890123', siteLocation: 'Jaffna', propertyType: 'Other', status: 'Completed' },
    { inspectionRequestId: new mongoose.Types.ObjectId(), clientId: new mongoose.Types.ObjectId(), clientName: 'Eve', email: 'eve@example.com', phone: '5678901234', siteLocation: 'Matara', propertyType: 'House', status: 'PaymentVerified' },
  ]);

  // ProjectEstimation
  await ProjectEstimation.deleteMany({});
  await ProjectEstimation.insertMany([
    { projectId: new mongoose.Types.ObjectId(), version: 1, laborCost: 2000, materialCost: 3000, serviceCost: 1000, contingencyCost: 500, total: 6500, createdBy: new mongoose.Types.ObjectId() },
    { projectId: new mongoose.Types.ObjectId(), version: 2, laborCost: 2500, materialCost: 3500, serviceCost: 1200, contingencyCost: 600, total: 7800, createdBy: new mongoose.Types.ObjectId() },
    { projectId: new mongoose.Types.ObjectId(), version: 1, laborCost: 1800, materialCost: 2200, serviceCost: 900, contingencyCost: 400, total: 5300, createdBy: new mongoose.Types.ObjectId() },
    { projectId: new mongoose.Types.ObjectId(), version: 3, laborCost: 3000, materialCost: 4000, serviceCost: 1500, contingencyCost: 700, total: 10200, createdBy: new mongoose.Types.ObjectId() },
    { projectId: new mongoose.Types.ObjectId(), version: 1, laborCost: 2100, materialCost: 3100, serviceCost: 1100, contingencyCost: 550, total: 6850, createdBy: new mongoose.Types.ObjectId() },
  ]);

  // Payment
  await Payment.deleteMany({});
  await Payment.insertMany([
    { projectId: new mongoose.Types.ObjectId(), clientId: new mongoose.Types.ObjectId(), amount: 1000, method: 'Bank', type: 'InspectionCost', status: 'Pending' },
    { projectId: new mongoose.Types.ObjectId(), clientId: new mongoose.Types.ObjectId(), amount: 2000, method: 'Online', type: 'ProjectPayment', status: 'Approved' },
    { projectId: new mongoose.Types.ObjectId(), clientId: new mongoose.Types.ObjectId(), amount: 3000, method: 'Cash', type: 'Advance', status: 'Rejected' },
    { projectId: new mongoose.Types.ObjectId(), clientId: new mongoose.Types.ObjectId(), amount: 4000, method: 'Bank', type: 'ProjectPayment', status: 'Pending' },
    { projectId: new mongoose.Types.ObjectId(), clientId: new mongoose.Types.ObjectId(), amount: 5000, method: 'Online', type: 'InspectionCost', status: 'Approved' },
  ]);

  // QuotationEstimation
  await QuotationEstimation.deleteMany({});
  await QuotationEstimation.insertMany([
    { projectId: new mongoose.Types.ObjectId(), estimateVersion: 1, version: 1, status: 'Draft', createdBy: new mongoose.Types.ObjectId(), laborItems: [], materialItems: [], serviceItems: [], contingencyItems: [], taxes: [], subtotal: 1000, totalContingency: 100, totalTax: 50, grandTotal: 1150 },
    { projectId: new mongoose.Types.ObjectId(), estimateVersion: 1, version: 2, status: 'Sent', createdBy: new mongoose.Types.ObjectId(), laborItems: [], materialItems: [], serviceItems: [], contingencyItems: [], taxes: [], subtotal: 2000, totalContingency: 200, totalTax: 100, grandTotal: 2300 },
    { projectId: new mongoose.Types.ObjectId(), estimateVersion: 2, version: 1, status: 'Revised', createdBy: new mongoose.Types.ObjectId(), laborItems: [], materialItems: [], serviceItems: [], contingencyItems: [], taxes: [], subtotal: 3000, totalContingency: 300, totalTax: 150, grandTotal: 3450 },
    { projectId: new mongoose.Types.ObjectId(), estimateVersion: 2, version: 2, status: 'Confirmed', createdBy: new mongoose.Types.ObjectId(), laborItems: [], materialItems: [], serviceItems: [], contingencyItems: [], taxes: [], subtotal: 4000, totalContingency: 400, totalTax: 200, grandTotal: 4600 },
    { projectId: new mongoose.Types.ObjectId(), estimateVersion: 3, version: 1, status: 'Locked', createdBy: new mongoose.Types.ObjectId(), laborItems: [], materialItems: [], serviceItems: [], contingencyItems: [], taxes: [], subtotal: 5000, totalContingency: 500, totalTax: 250, grandTotal: 5750 },
  ]);

  // Expense
  await Expense.deleteMany({});
  await Expense.insertMany([
    { projectId: new mongoose.Types.ObjectId(), amount: 100, description: 'Expense 1', category: 'Labor' },
    { projectId: new mongoose.Types.ObjectId(), amount: 200, description: 'Expense 2', category: 'Procurement' },
    { projectId: new mongoose.Types.ObjectId(), amount: 300, description: 'Expense 3', category: 'Transport' },
    { projectId: new mongoose.Types.ObjectId(), amount: 400, description: 'Expense 4', category: 'Misc' },
    { projectId: new mongoose.Types.ObjectId(), amount: 500, description: 'Expense 5', category: 'Labor' },
  ]);

  console.log('Dummy data inserted for all models.');
  await mongoose.disconnect();
}

seed();
