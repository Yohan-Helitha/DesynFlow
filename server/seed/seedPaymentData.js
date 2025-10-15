import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
import User from '../modules/auth/model/user.model.js';
import Project from '../modules/project/model/project.model.js';
import Payment from '../modules/finance/model/payment.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/desynflow';

// Sample receipt URLs (simulating uploaded files)
const SAMPLE_RECEIPTS = [
  'uploads/payments/receipt-2025-01-15-001.pdf',
  'uploads/payments/receipt-2025-01-20-002.pdf',
  'uploads/payments/receipt-2025-02-05-003.pdf',
  'uploads/payments/receipt-2025-02-18-004.pdf',
  'uploads/payments/receipt-2025-03-10-005.pdf',
  'uploads/payments/receipt-2025-03-25-006.pdf',
  null, // No receipt
  null, // No receipt
  null, // No receipt
];

async function seedPaymentData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing payment data...');
    const deletedPayments = await Payment.deleteMany({});
    const deletedProjects = await Project.deleteMany({});
    const deletedUsers = await User.deleteMany({});
    console.log(`   - Deleted ${deletedPayments.deletedCount} payments`);
    console.log(`   - Deleted ${deletedProjects.deletedCount} projects`);
    console.log(`   - Deleted ${deletedUsers.deletedCount} users`);

    // ==================== CREATE USERS ====================
    console.log('\n👥 Creating users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create Clients (12)
    const clients = [];
    const clientNames = [
      { username: 'john_anderson', email: 'john.anderson@email.com', phone: '+94771234567' },
      { username: 'sarah_williams', email: 'sarah.williams@email.com', phone: '+94772345678' },
      { username: 'michael_brown', email: 'michael.brown@email.com', phone: '+94773456789' },
      { username: 'emily_davis', email: 'emily.davis@email.com', phone: '+94774567890' },
      { username: 'david_miller', email: 'david.miller@email.com', phone: '+94775678901' },
      { username: 'jennifer_wilson', email: 'jennifer.wilson@email.com', phone: '+94776789012' },
      { username: 'robert_moore', email: 'robert.moore@email.com', phone: '+94777890123' },
      { username: 'lisa_taylor', email: 'lisa.taylor@email.com', phone: '+94778901234' },
      { username: 'william_anderson', email: 'william.anderson@email.com', phone: '+94779012345' },
      { username: 'mary_thomas', email: 'mary.thomas@email.com', phone: '+94770123456' },
      { username: 'james_jackson', email: 'james.jackson@email.com', phone: '+94771112222' },
      { username: 'patricia_white', email: 'patricia.white@email.com', phone: '+94772223333' },
    ];

    for (const clientData of clientNames) {
      const client = await User.create({
        username: clientData.username,
        email: clientData.email,
        password: hashedPassword,
        role: 'client',
        phone: clientData.phone,
        address: 'Colombo, Sri Lanka',
        isActive: true,
      });
      clients.push(client);
    }
    console.log(`   ✅ Created ${clients.length} clients`);

    // Create Finance Managers (2)
    const financeManagers = [];
    const financeManagerData = [
      { username: 'finance_manager_1', email: 'fm1@desynflow.com', phone: '+94771234000' },
      { username: 'finance_manager_2', email: 'fm2@desynflow.com', phone: '+94772345000' },
    ];

    for (const fmData of financeManagerData) {
      const fm = await User.create({
        username: fmData.username,
        email: fmData.email,
        password: hashedPassword,
        role: 'finance manager',
        phone: fmData.phone,
        isActive: true,
      });
      financeManagers.push(fm);
    }
    console.log(`   ✅ Created ${financeManagers.length} finance managers`);

    // ==================== CREATE PROJECTS ====================
    console.log('\n🏗️  Creating projects...');
    
    const projectData = [
      { name: 'Luxury Villa - Mount Lavinia', budget: 15000000, client: clients[0] },
      { name: 'Modern Office Complex - Colombo 03', budget: 45000000, client: clients[1] },
      { name: 'Residential Apartment - Kandy', budget: 8500000, client: clients[2] },
      { name: 'Beach Resort - Bentota', budget: 35000000, client: clients[3] },
      { name: 'Shopping Mall - Negombo', budget: 62000000, client: clients[4] },
      { name: 'Hotel Renovation - Galle', budget: 18500000, client: clients[5] },
      { name: 'Condominium - Dehiwala', budget: 12000000, client: clients[6] },
      { name: 'Restaurant & Bar - Colombo 07', budget: 4500000, client: clients[7] },
      { name: 'School Building - Matara', budget: 22000000, client: clients[8] },
      { name: 'Warehouse Facility - Katunayake', budget: 28000000, client: clients[9] },
      { name: 'Private Residence - Nuwara Eliya', budget: 9500000, client: clients[10] },
      { name: 'Medical Center - Kurunegala', budget: 16500000, client: clients[11] },
    ];

    const projects = [];
    for (const projData of projectData) {
      const project = await Project.create({
        projectName: projData.name,
        budget: projData.budget,
        clientId: projData.client._id,
        status: 'Active',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2025-12-31'),
        description: `Construction project for ${projData.name}`,
      });
      projects.push(project);
    }
    console.log(`   ✅ Created ${projects.length} projects`);

    // ==================== CREATE PAYMENTS ====================
    console.log('\n💰 Creating payments...');
    
    const paymentMethods = ['Bank', 'Online', 'Cash'];
    const paymentTypes = ['InspectionCost', 'ProjectPayment', 'Advance'];
    const paymentStatuses = ['Pending', 'Approved', 'Rejected'];

    const payments = [];

    // Pending Payments WITH receipts (should be verifiable)
    const pendingWithReceipts = [
      {
        projectId: projects[0]._id,
        clientId: clients[0]._id,
        amount: 250000,
        method: 'Bank',
        type: 'Advance',
        receiptUrl: SAMPLE_RECEIPTS[0],
        status: 'Pending',
        comment: null,
      },
      {
        projectId: projects[1]._id,
        clientId: clients[1]._id,
        amount: 1500000,
        method: 'Online',
        type: 'ProjectPayment',
        receiptUrl: SAMPLE_RECEIPTS[1],
        status: 'Pending',
        comment: null,
      },
      {
        projectId: projects[2]._id,
        clientId: clients[2]._id,
        amount: 75000,
        method: 'Bank',
        type: 'InspectionCost',
        receiptUrl: SAMPLE_RECEIPTS[2],
        status: 'Pending',
        comment: null,
      },
      {
        projectId: projects[3]._id,
        clientId: clients[3]._id,
        amount: 2800000,
        method: 'Bank',
        type: 'ProjectPayment',
        receiptUrl: SAMPLE_RECEIPTS[3],
        status: 'Pending',
        comment: null,
      },
    ];

    for (const paymentData of pendingWithReceipts) {
      const payment = await Payment.create(paymentData);
      payments.push(payment);
    }
    console.log(`   ✅ Created ${pendingWithReceipts.length} pending payments WITH receipts`);

    // Pending Payments WITHOUT receipts (should NOT be verifiable)
    const pendingWithoutReceipts = [
      {
        projectId: projects[4]._id,
        clientId: clients[4]._id,
        amount: 850000,
        method: 'Online',
        type: 'Advance',
        receiptUrl: null,
        status: 'Pending',
        comment: null,
      },
      {
        projectId: projects[5]._id,
        clientId: clients[5]._id,
        amount: 125000,
        method: 'Cash',
        type: 'InspectionCost',
        receiptUrl: null,
        status: 'Pending',
        comment: null,
      },
      {
        projectId: projects[6]._id,
        clientId: clients[6]._id,
        amount: 450000,
        method: 'Bank',
        type: 'Advance',
        receiptUrl: null,
        status: 'Pending',
        comment: null,
      },
      {
        projectId: projects[7]._id,
        clientId: clients[7]._id,
        amount: 1200000,
        method: 'Online',
        type: 'ProjectPayment',
        receiptUrl: null,
        status: 'Pending',
        comment: null,
      },
      {
        projectId: projects[8]._id,
        clientId: clients[8]._id,
        amount: 680000,
        method: 'Bank',
        type: 'Advance',
        receiptUrl: null,
        status: 'Pending',
        comment: null,
      },
    ];

    for (const paymentData of pendingWithoutReceipts) {
      const payment = await Payment.create(paymentData);
      payments.push(payment);
    }
    console.log(`   ✅ Created ${pendingWithoutReceipts.length} pending payments WITHOUT receipts`);

    // Approved Payments (already verified)
    const approvedPayments = [
      {
        projectId: projects[9]._id,
        clientId: clients[9]._id,
        amount: 3500000,
        method: 'Bank',
        type: 'ProjectPayment',
        receiptUrl: SAMPLE_RECEIPTS[4],
        status: 'Approved',
        comment: 'Payment verified and approved',
        verifiedBy: financeManagers[0]._id,
      },
      {
        projectId: projects[10]._id,
        clientId: clients[10]._id,
        amount: 185000,
        method: 'Online',
        type: 'InspectionCost',
        receiptUrl: SAMPLE_RECEIPTS[5],
        status: 'Approved',
        comment: 'Inspection cost approved',
        verifiedBy: financeManagers[1]._id,
      },
      {
        projectId: projects[11]._id,
        clientId: clients[11]._id,
        amount: 950000,
        method: 'Bank',
        type: 'Advance',
        receiptUrl: SAMPLE_RECEIPTS[6],
        status: 'Approved',
        comment: 'Advance payment approved',
        verifiedBy: financeManagers[0]._id,
      },
      {
        projectId: projects[0]._id,
        clientId: clients[0]._id,
        amount: 1750000,
        method: 'Bank',
        type: 'ProjectPayment',
        receiptUrl: 'uploads/payments/receipt-2025-04-01-007.pdf',
        status: 'Approved',
        comment: 'Project milestone payment',
        verifiedBy: financeManagers[1]._id,
      },
      {
        projectId: projects[1]._id,
        clientId: clients[1]._id,
        amount: 4200000,
        method: 'Bank',
        type: 'ProjectPayment',
        receiptUrl: 'uploads/payments/receipt-2025-04-15-008.pdf',
        status: 'Approved',
        comment: 'Second installment approved',
        verifiedBy: financeManagers[0]._id,
      },
    ];

    for (const paymentData of approvedPayments) {
      const payment = await Payment.create(paymentData);
      payments.push(payment);
    }
    console.log(`   ✅ Created ${approvedPayments.length} approved payments`);

    // Rejected Payments
    const rejectedPayments = [
      {
        projectId: projects[2]._id,
        clientId: clients[2]._id,
        amount: 125000,
        method: 'Cash',
        type: 'InspectionCost',
        receiptUrl: null,
        status: 'Rejected',
        comment: 'Receipt not provided, payment cannot be verified',
      },
      {
        projectId: projects[3]._id,
        clientId: clients[3]._id,
        amount: 450000,
        method: 'Online',
        type: 'Advance',
        receiptUrl: 'uploads/payments/receipt-2025-02-10-009.pdf',
        status: 'Rejected',
        comment: 'Receipt does not match payment amount',
      },
      {
        projectId: projects[5]._id,
        clientId: clients[5]._id,
        amount: 880000,
        method: 'Bank',
        type: 'ProjectPayment',
        receiptUrl: null,
        status: 'Rejected',
        comment: 'Missing required documentation',
      },
    ];

    for (const paymentData of rejectedPayments) {
      const payment = await Payment.create(paymentData);
      payments.push(payment);
    }
    console.log(`   ✅ Created ${rejectedPayments.length} rejected payments`);

    // Additional mixed payments for comprehensive testing
    const additionalPayments = [
      {
        projectId: projects[4]._id,
        clientId: clients[4]._id,
        amount: 5500000,
        method: 'Bank',
        type: 'ProjectPayment',
        receiptUrl: 'uploads/payments/receipt-2025-05-01-010.pdf',
        status: 'Approved',
        comment: 'Major project payment verified',
        verifiedBy: financeManagers[1]._id,
      },
      {
        projectId: projects[6]._id,
        clientId: clients[6]._id,
        amount: 95000,
        method: 'Online',
        type: 'InspectionCost',
        receiptUrl: 'uploads/payments/receipt-2025-05-10-011.pdf',
        status: 'Pending',
        comment: null,
      },
      {
        projectId: projects[7]._id,
        clientId: clients[7]._id,
        amount: 320000,
        method: 'Cash',
        type: 'Advance',
        receiptUrl: null,
        status: 'Pending',
        comment: null,
      },
    ];

    for (const paymentData of additionalPayments) {
      const payment = await Payment.create(paymentData);
      payments.push(payment);
    }
    console.log(`   ✅ Created ${additionalPayments.length} additional payments`);

    // ==================== SUMMARY ====================
    console.log('\n' + '='.repeat(60));
    console.log('📊 PAYMENT SEED DATA SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n👥 Users Created:');
    console.log(`   - Clients: ${clients.length}`);
    console.log(`   - Finance Managers: ${financeManagers.length}`);
    console.log(`   - Total Users: ${clients.length + financeManagers.length}`);

    console.log('\n🏗️  Projects Created: ${projects.length}');

    console.log('\n💰 Payments Created:');
    const pendingCount = payments.filter(p => p.status === 'Pending').length;
    const approvedCount = payments.filter(p => p.status === 'Approved').length;
    const rejectedCount = payments.filter(p => p.status === 'Rejected').length;
    const withReceiptCount = payments.filter(p => p.receiptUrl).length;
    const withoutReceiptCount = payments.filter(p => !p.receiptUrl).length;

    console.log(`   - Total Payments: ${payments.length}`);
    console.log(`   - Pending: ${pendingCount}`);
    console.log(`   - Approved: ${approvedCount}`);
    console.log(`   - Rejected: ${rejectedCount}`);
    console.log(`   - With Receipts: ${withReceiptCount}`);
    console.log(`   - Without Receipts: ${withoutReceiptCount}`);

    console.log('\n📋 Payment Types:');
    const inspectionCostCount = payments.filter(p => p.type === 'InspectionCost').length;
    const projectPaymentCount = payments.filter(p => p.type === 'ProjectPayment').length;
    const advanceCount = payments.filter(p => p.type === 'Advance').length;
    console.log(`   - Inspection Cost: ${inspectionCostCount}`);
    console.log(`   - Project Payment: ${projectPaymentCount}`);
    console.log(`   - Advance: ${advanceCount}`);

    console.log('\n💳 Payment Methods:');
    const bankCount = payments.filter(p => p.method === 'Bank').length;
    const onlineCount = payments.filter(p => p.method === 'Online').length;
    const cashCount = payments.filter(p => p.method === 'Cash').length;
    console.log(`   - Bank Transfer: ${bankCount}`);
    console.log(`   - Online Payment: ${onlineCount}`);
    console.log(`   - Cash: ${cashCount}`);

    console.log('\n🔍 Key Testing Scenarios:');
    console.log(`   ✅ Pending payments WITH receipts (verifiable): ${pendingWithReceipts.length}`);
    console.log(`   ⚠️  Pending payments WITHOUT receipts (NOT verifiable): ${pendingWithoutReceipts.length}`);
    console.log(`   ✅ Approved payments: ${approvedCount}`);
    console.log(`   ❌ Rejected payments: ${rejectedCount}`);

    console.log('\n💡 Test Cases Covered:');
    console.log('   1. ✅ Verify Payment button should be ENABLED for pending payments with receipts');
    console.log('   2. ✅ Verify Payment button should be DISABLED for pending payments without receipts');
    console.log('   3. ✅ Approved payments should not show verify/reject buttons');
    console.log('   4. ✅ Rejected payments should show in payment history');
    console.log('   5. ✅ Different payment methods (Bank, Online, Cash)');
    console.log('   6. ✅ Different payment types (InspectionCost, ProjectPayment, Advance)');
    console.log('   7. ✅ Payments linked to different projects and clients');
    console.log('   8. ✅ Comments on approved/rejected payments');

    console.log('\n🔐 Login Credentials:');
    console.log('   Email: john.anderson@email.com (or any client email above)');
    console.log('   Email: fm1@desynflow.com (Finance Manager)');
    console.log('   Password: password123');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Payment seed data created successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error seeding payment data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
seedPaymentData();
