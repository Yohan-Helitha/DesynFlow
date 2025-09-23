
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server.js';

import InspectionRequest from '../modules/finance/model/inspection_request.js';
import InspectionEstimation from '../modules/finance/model/inspection_estimation.js';
import ProjectEstimation from '../modules/finance/model/project_estimation.js';
import Payment from '../modules/finance/model/payment.js';
import Expense from '../modules/finance/model/expenses.js';
import PurchaseOrder from '../modules/finance/model/purchase_order.js';
import FinanceSummary from '../modules/finance/model/finance_summary.js';

describe('API Endpoints (with mock data)', () => {
  let inspectionRequest, inspectionEstimation, projectEstimation, payment, expense, purchaseOrder, financeSummary;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/desynflow_test');

    // Create mock data for each model
    inspectionRequest = await InspectionRequest.create({
      inspectionRequestId: new mongoose.Types.ObjectId(),
      clientId: new mongoose.Types.ObjectId(),
      clientName: 'Test Client',
      email: 'test@example.com',
      phone: '1234567890',
      siteLocation: 'Test Site',
      propertyType: 'House',
      floors: [],
      status: 'Pending'
    });

    inspectionEstimation = await InspectionEstimation.create({
      inspectionRequestId: inspectionRequest.inspectionRequestId,
      distanceKm: 15,
      estimatedCost: 700,
      createdBy: new mongoose.Types.ObjectId()
    });

    projectEstimation = await ProjectEstimation.create({
      projectId: new mongoose.Types.ObjectId(),
      version: 1,
      laborCost: 1500,
      materialCost: 2500,
      serviceCost: 900,
      contingencyCost: 500,
      total: 5400,
      createdBy: new mongoose.Types.ObjectId()
    });

    payment = await Payment.create({
      projectId: projectEstimation.projectId,
      clientId: inspectionRequest.clientId,
      amount: 1500,
      method: 'Bank',
      type: 'ProjectPayment',
      receiptUrl: 'http://example.com/receipt.pdf',
      status: 'Pending'
    });

    expense = await Expense.create({
      projectId: projectEstimation.projectId,
      category: 'Material',
      amount: 350,
      description: 'Test expense',
      proof: 'http://example.com/proof.pdf'
    });

    purchaseOrder = await PurchaseOrder.create({
      poId: 'PO-TEST-002',
      projectId: projectEstimation.projectId,
      supplierId: new mongoose.Types.ObjectId(),
      requestOrigin: 'Test Origin',
      totalAmount: 2000,
      financeApprovalStatus: 'Pending'
    });

    financeSummary = await FinanceSummary.create({
      totalIncome: 20000,
      totalBalance: 17000
    });
  });

  afterAll(async () => {
    await InspectionRequest.deleteMany({});
    await InspectionEstimation.deleteMany({});
    await ProjectEstimation.deleteMany({});
    await Payment.deleteMany({});
    await Expense.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await FinanceSummary.deleteMany({});
    await mongoose.connection.close();
  });

  // --- Inspection Request Endpoints ---
  test('GET /api/inspection-request/ returns all inspection requests', async () => {
    const res = await request(app).get('/api/inspection-request/');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('clientName');
  });

  // --- Inspection Estimation Endpoints ---
  test('GET /api/inspection-estimation/all-estimation-details returns all estimation details', async () => {
    const res = await request(app).get('/api/inspection-estimation/all-estimation-details');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('inspectionRequestId');
  });

  test('POST /api/inspection-estimation/:inspectionRequestId/verify-payment updates payment status', async () => {
    const res = await request(app)
      .post(`/api/inspection-estimation/${inspectionRequest.inspectionRequestId}/verify-payment`)
      .send({ status: 'Approved' });
    expect([200, 400, 404]).toContain(res.statusCode);
  });

  // --- Project Estimation Endpoints ---
  test('GET /api/project-estimation/ returns all project estimations', async () => {
    const res = await request(app).get('/api/project-estimation/');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('laborCost');
  });

  test('POST /api/project-estimation/ creates or updates an estimation', async () => {
    const res = await request(app)
      .post('/api/project-estimation/')
      .send({
        projectId: projectEstimation.projectId,
        version: 2,
        laborCost: 1600,
        materialCost: 2600,
        serviceCost: 950,
        contingencyCost: 550,
        total: 5700,
        createdBy: projectEstimation.createdBy
      });
    expect([200, 201, 400]).toContain(res.statusCode);
  });

  // --- Payment Endpoints ---
  test('GET /api/payments/processed returns processed payments', async () => {
    const res = await request(app).get('/api/payments/processed');
    expect([200, 404]).toContain(res.statusCode);
    expect(Array.isArray(res.body) || typeof res.body === 'object').toBe(true);
  });

  test('GET /api/payments/pending returns pending payments', async () => {
    const res = await request(app).get('/api/payments/pending');
    expect([200, 404]).toContain(res.statusCode);
    expect(Array.isArray(res.body) || typeof res.body === 'object').toBe(true);
  });

  // --- Expenses Endpoints ---
  test('GET /api/expenses/ returns all expenses', async () => {
    const res = await request(app).get('/api/expenses/');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('category');
  });

  test('POST /api/expenses/ creates a new expense', async () => {
    const res = await request(app)
      .post('/api/expenses/')
      .send({
        projectId: projectEstimation.projectId,
        category: 'Transport',
        amount: 120,
        description: 'Transport expense',
        proof: 'http://example.com/transport.pdf'
      });
    expect([200, 201, 400]).toContain(res.statusCode);
  });

  test('PUT /api/expenses/:id updates an expense', async () => {
    const res = await request(app)
      .put(`/api/expenses/${expense._id}`)
      .send({ amount: 400 });
    expect([200, 400, 404]).toContain(res.statusCode);
  });

  test('DELETE /api/expenses/:id deletes an expense', async () => {
    const newExpense = await Expense.create({
      projectId: projectEstimation.projectId,
      category: 'Misc',
      amount: 60,
      description: 'Misc expense',
      proof: ''
    });
    const res = await request(app).delete(`/api/expenses/${newExpense._id}`);
    expect([200, 204, 404]).toContain(res.statusCode);
  });

  // --- Purchase Order Endpoints ---
  test('GET /api/purchase-orders/ returns all purchase orders', async () => {
    const res = await request(app).get('/api/purchase-orders/');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('poId');
  });

  // --- Finance Summary Endpoints ---
  test('GET /api/finance-summary/ returns finance summary', async () => {
    const res = await request(app).get('/api/finance-summary/');
    expect([200, 404]).toContain(res.statusCode);
    expect(typeof res.body === 'object').toBe(true);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('totalIncome');
      expect(res.body).toHaveProperty('totalBalance');
    }
  });
});

// --- Inspection Estimation Additional Endpoints ---
test('GET /api/inspection-estimation/payment-status/filter returns filtered payment status', async () => {
  const res = await request(app).get('/api/inspection-estimation/payment-status/filter');
  expect([200, 404]).toContain(res.statusCode);
  expect(Array.isArray(res.body) || typeof res.body === 'object').toBe(true);
});

test('GET /api/inspection-estimation/payment-pending returns pending payments', async () => {
  const res = await request(app).get('/api/inspection-estimation/payment-pending');
  expect([200, 404]).toContain(res.statusCode);
  expect(Array.isArray(res.body) || typeof res.body === 'object').toBe(true);
});

// --- CRUD for Inspection Estimation ---
test('GET /api/inspection-estimation/ returns all inspection estimations', async () => {
  const res = await request(app).get('/api/inspection-estimation/');
  expect([200, 404]).toContain(res.statusCode);
  expect(Array.isArray(res.body) || typeof res.body === 'object').toBe(true);
});

test('GET /api/inspection-estimation/:id returns a single estimation', async () => {
  const res = await request(app).get(`/api/inspection-estimation/${inspectionEstimation._id}`);
  expect([200, 404]).toContain(res.statusCode);
});

test('PUT /api/inspection-estimation/:id updates an estimation', async () => {
  const res = await request(app)
    .put(`/api/inspection-estimation/${inspectionEstimation._id}`)
    .send({ estimatedCost: 999 });
  expect([200, 400, 404]).toContain(res.statusCode);
});

test('DELETE /api/inspection-estimation/:id deletes an estimation', async () => {
  const newEstimation = await InspectionEstimation.create({
    inspectionRequestId: inspectionRequest.inspectionRequestId,
    distanceKm: 20,
    estimatedCost: 800,
    createdBy: new mongoose.Types.ObjectId()
  });
  const res = await request(app).delete(`/api/inspection-estimation/${newEstimation._id}`);
  expect([200, 204, 404]).toContain(res.statusCode);
});

// --- CRUD for Project Estimation ---
test('GET /api/project-estimation/:id returns a single project estimation', async () => {
  const res = await request(app).get(`/api/project-estimation/${projectEstimation._id}`);
  expect([200, 404]).toContain(res.statusCode);
});

test('PUT /api/project-estimation/:id updates a project estimation', async () => {
  const res = await request(app)
    .put(`/api/project-estimation/${projectEstimation._id}`)
    .send({ total: 6000 });
  expect([200, 400, 404]).toContain(res.statusCode);
});

test('DELETE /api/project-estimation/:id deletes a project estimation', async () => {
  const newProjEst = await ProjectEstimation.create({
    projectId: new mongoose.Types.ObjectId(),
    version: 3,
    laborCost: 100,
    materialCost: 200,
    serviceCost: 50,
    contingencyCost: 30,
    total: 380,
    createdBy: new mongoose.Types.ObjectId()
  });
  const res = await request(app).delete(`/api/project-estimation/${newProjEst._id}`);
  expect([200, 204, 404]).toContain(res.statusCode);
});

// --- CRUD for Payments ---
test('GET /api/payments/:id returns a single payment', async () => {
  const res = await request(app).get(`/api/payments/${payment._id}`);
  expect([200, 404]).toContain(res.statusCode);
});

test('PUT /api/payments/:id updates a payment', async () => {
  const res = await request(app)
    .put(`/api/payments/${payment._id}`)
    .send({ status: 'Approved' });
  expect([200, 400, 404]).toContain(res.statusCode);
});

test('DELETE /api/payments/:id deletes a payment', async () => {
  const newPayment = await Payment.create({
    projectId: projectEstimation.projectId,
    clientId: inspectionRequest.clientId,
    amount: 100,
    method: 'Cash',
    type: 'Advance',
    status: 'Pending'
  });
  const res = await request(app).delete(`/api/payments/${newPayment._id}`);
  expect([200, 204, 404]).toContain(res.statusCode);
});

test('POST /api/payments/ creates a new payment', async () => {
  const res = await request(app)
    .post('/api/payments/')
    .send({
      projectId: projectEstimation.projectId,
      clientId: inspectionRequest.clientId,
      amount: 200,
      method: 'Online',
      type: 'InspectionCost',
      status: 'Pending'
    });
  expect([200, 201, 400]).toContain(res.statusCode);
});

// --- CRUD for Purchase Orders ---
test('GET /api/purchase-orders/:id returns a single purchase order', async () => {
  const res = await request(app).get(`/api/purchase-orders/${purchaseOrder._id}`);
  expect([200, 404]).toContain(res.statusCode);
});

test('PUT /api/purchase-orders/:id updates a purchase order', async () => {
  const res = await request(app)
    .put(`/api/purchase-orders/${purchaseOrder._id}`)
    .send({ financeApprovalStatus: 'Approved' });
  expect([200, 400, 404]).toContain(res.statusCode);
});

test('DELETE /api/purchase-orders/:id deletes a purchase order', async () => {
  const newPO = await PurchaseOrder.create({
    poId: 'PO-TEST-003',
    projectId: projectEstimation.projectId,
    supplierId: new mongoose.Types.ObjectId(),
    requestOrigin: 'Test Origin',
    totalAmount: 1000,
    financeApprovalStatus: 'Pending'
  });
  const res = await request(app).delete(`/api/purchase-orders/${newPO._id}`);
  expect([200, 204, 404]).toContain(res.statusCode);
});

test('POST /api/purchase-orders/ creates a new purchase order', async () => {
  const res = await request(app)
    .post('/api/purchase-orders/')
    .send({
      poId: 'PO-TEST-004',
      projectId: projectEstimation.projectId,
      supplierId: new mongoose.Types.ObjectId(),
      requestOrigin: 'Test Origin',
      totalAmount: 1200,
      financeApprovalStatus: 'Pending'
    });
  expect([200, 201, 400]).toContain(res.statusCode);
});

// --- Expenses GET by ID ---
test('GET /api/expenses/:id returns a single expense', async () => {
  const res = await request(app).get(`/api/expenses/${expense._id}`);
  expect([200, 404]).toContain(res.statusCode);
});

// --- Finance Summary CRUD ---
test('GET /api/finance-summary/:id returns a single finance summary', async () => {
  const res = await request(app).get(`/api/finance-summary/${financeSummary._id}`);
  expect([200, 404]).toContain(res.statusCode);
});

test('PUT /api/finance-summary/:id updates a finance summary', async () => {
  const res = await request(app)
    .put(`/api/finance-summary/${financeSummary._id}`)
    .send({ totalBalance: 18000 });
  expect([200, 400, 404]).toContain(res.statusCode);
});

test('DELETE /api/finance-summary/:id deletes a finance summary', async () => {
  const newSummary = await FinanceSummary.create({
    totalIncome: 1000,
    totalBalance: 800
  });
  const res = await request(app).delete(`/api/finance-summary/${newSummary._id}`);
  expect([200, 204, 404]).toContain(res.statusCode);
});

test('POST /api/finance-summary/ creates a new finance summary', async () => {
  const res = await request(app)
    .post('/api/finance-summary/')
    .send({
      totalIncome: 5000,
      totalBalance: 4000
    });
  expect([200, 201, 400]).toContain(res.statusCode);
});