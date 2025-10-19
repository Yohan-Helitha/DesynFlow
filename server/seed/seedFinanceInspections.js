/*
 Finance Manager Inspection Management Seed
 Creates diverse inspection requests and estimations to test all finance portal features:
 
 PENDING INSPECTIONS TAB (5 items):
   - 5 requests with status 'pending' (no estimation yet) for generating estimates
 
 INSPECTION ESTIMATION HISTORY TAB (5 items):
   - 5 requests with sent estimations (various paymentStatus for tracking)
 
 INSPECTION PAYMENTS TAB (5 items):
   - 5 requests where clients uploaded payment receipts (paymentStatus: 'uploaded')
   - Finance manager can verify or reject these payments
 
 INSPECTION PAYMENTS HISTORY TAB (5 items):
   - 5 requests with verified/rejected payment status
 
 Total: 20 inspection requests covering all finance manager workflows
 
 Usage:
   node server/seed/seedFinanceInspections.js
*/
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../modules/auth/model/user.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import InspectionEstimate from '../modules/finance/model/inspection_estimation.js';

dotenv.config();

async function ensureUsers(){
  // Use multiple existing clients for variety (or create if needed)
  let clients = await User.find({ role: 'client', isActive: true }).limit(5).lean();
  
  // Create clients if we don't have enough
  while (clients.length < 5) {
    const newClient = await new User({
      username: `finTestClient${clients.length + 1}`,
      email: `fin.test.client${clients.length + 1}@example.com`,
      password: 'Password@123',
      phone: `077100000${clients.length}`,
      role: 'client', isVerified: true, isActive: true
    }).save();
    clients.push(newClient);
  }
  
  let finance = await User.findOne({ role: /finance/i, isActive: true });
  if(!finance){
    finance = await new User({
      username: 'financeManager',
      email: 'finance.manager@desynflow.com',
      password: 'Admin@123',
      phone: '0711000001',
      role: 'finance manager', isVerified: true, isActive: true
    }).save();
  }
  
  return { clients, finance };
}

function createRequest(client, address, city, status){
  return new InspectionRequest({
    client_ID: client._id,
    client_name: client.username || client.name || client.email.split('@')[0],
    email: client.email,
    phone_number: client.phone || '0770000000',
    propertyLocation_address: address,
    propertyLocation_city: city || 'Colombo',
    propertyType: 'residential',
    number_of_floor: Math.floor(Math.random() * 3) + 1,
    number_of_room: Math.floor(Math.random() * 5) + 2,
    room_name: ['Living Room','Kitchen','Bedroom'],
    status,
    inspection_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // last week
  });
}

async function upsertEstimate(inspectionRequestId, finance, data){
  return InspectionEstimate.findOneAndUpdate(
    { inspectionRequestId },
    { $set: { ...data, createdBy: finance._id } },
    { new: true, upsert: true }
  );
}

async function main(){
  try{
    await connectDB();
    const { clients, finance } = await ensureUsers();
    
    console.log(`Using ${clients.length} clients and finance user: ${finance.email}\n`);

    // Clean previous finance seed data (by marker addresses)
    const markerPattern = /^(FIN-PEND|FIN-EST|FIN-PAY|FIN-HIST)-/;
    const prevReqs = await InspectionRequest.find({ propertyLocation_address: markerPattern }).select('_id');
    if (prevReqs.length) {
      const ids = prevReqs.map(r => r._id);
      await InspectionEstimate.deleteMany({ inspectionRequestId: { $in: ids } });
      await InspectionRequest.deleteMany({ _id: { $in: ids } });
      console.log(`Cleaned ${prevReqs.length} previous finance seed records.\n`);
    }

    const cities = ['Colombo', 'Galle', 'Kandy', 'Negombo', 'Jaffna'];
    let idx = 0;

    // ========== PENDING INSPECTIONS (5) ==========
    console.log('Creating PENDING INSPECTIONS (no estimation yet)...');
    const pendingReqs = [];
    for (let i = 1; i <= 5; i++) {
      const client = clients[idx % clients.length];
      const req = await createRequest(
        client,
        `FIN-PEND-${i} Inspection Lane`,
        cities[idx % cities.length],
        'pending'
      ).save();
      pendingReqs.push(req);
      console.log(`  [${i}] ${req.propertyLocation_address} (${client.email})`);
      idx++;
    }

    // ========== ESTIMATION HISTORY (5) ==========
    console.log('\nCreating ESTIMATION HISTORY (sent estimates, various statuses)...');
    const estHistoryReqs = [];
    const estStatuses = ['pending', 'pending', 'pending', 'uploaded', 'uploaded'];
    for (let i = 1; i <= 5; i++) {
      const client = clients[idx % clients.length];
      const req = await createRequest(
        client,
        `FIN-EST-${i} Estimate Street`,
        cities[idx % cities.length],
        'sent'
      ).save();
      await upsertEstimate(req._id, finance, {
        distanceKm: 10 + i * 5,
        estimatedCost: 8000 + i * 2000,
        paymentStatus: estStatuses[i - 1],
        ...(estStatuses[i - 1] === 'uploaded' && { paymentReceiptUrl: `/uploads/inspection_payments/fin-est-${i}-receipt.pdf` })
      });
      estHistoryReqs.push(req);
      console.log(`  [${i}] ${req.propertyLocation_address} (paymentStatus: ${estStatuses[i - 1]})`);
      idx++;
    }

    // ========== INSPECTION PAYMENTS (5 - uploaded receipts awaiting verification) ==========
    console.log('\nCreating INSPECTION PAYMENTS (receipts uploaded, awaiting verification)...');
    const paymentReqs = [];
    for (let i = 1; i <= 5; i++) {
      const client = clients[idx % clients.length];
      const req = await createRequest(
        client,
        `FIN-PAY-${i} Payment Avenue`,
        cities[idx % cities.length],
        'sent'
      ).save();
      await upsertEstimate(req._id, finance, {
        distanceKm: 15 + i * 3,
        estimatedCost: 10000 + i * 1500,
        paymentStatus: 'uploaded',
        paymentReceiptUrl: `/uploads/inspection_payments/fin-pay-${i}-receipt.pdf`
      });
      paymentReqs.push(req);
      console.log(`  [${i}] ${req.propertyLocation_address} (receipt uploaded)`);
      idx++;
    }

    // ========== PAYMENTS HISTORY (5 - verified/rejected) ==========
    console.log('\nCreating PAYMENTS HISTORY (verified/rejected payments)...');
    const historyReqs = [];
    const historyStatuses = ['verified', 'verified', 'verified', 'rejected', 'rejected'];
    const historyReqStatuses = ['verified', 'verified', 'assigned', 'sent', 'sent'];
    for (let i = 1; i <= 5; i++) {
      const client = clients[idx % clients.length];
      const req = await createRequest(
        client,
        `FIN-HIST-${i} History Road`,
        cities[idx % cities.length],
        historyReqStatuses[i - 1]
      ).save();
      await upsertEstimate(req._id, finance, {
        distanceKm: 20 + i * 2,
        estimatedCost: 12000 + i * 1000,
        paymentAmount: 12000 + i * 1000,
        paymentStatus: historyStatuses[i - 1],
        paymentReceiptUrl: `/uploads/inspection_payments/fin-hist-${i}-receipt.pdf`
      });
      historyReqs.push(req);
      console.log(`  [${i}] ${req.propertyLocation_address} (paymentStatus: ${historyStatuses[i - 1]})`);
      idx++;
    }

    // ========== SUMMARY ==========
    const allIds = [...pendingReqs, ...estHistoryReqs, ...paymentReqs, ...historyReqs].map(r => r._id);
    const [reqCount, estCount] = await Promise.all([
      InspectionRequest.countDocuments({ _id: { $in: allIds } }),
      InspectionEstimate.countDocuments({ inspectionRequestId: { $in: allIds } })
    ]);

    console.log('\n=== FINANCE INSPECTION SEED COMPLETE ===');
    console.log(`Total Requests: ${reqCount} (expected 20)`);
    console.log(`Total Estimations: ${estCount} (expected 15)`);
    console.log('\nFinance Portal → Inspection Management:');
    console.log('  • Pending Inspections: 5 items (can generate estimates)');
    console.log('  • Inspection Estimation History: 5 items (track sent estimates)');
    console.log('  • Inspection Payments: 5 items (verify/reject uploaded receipts)');
    console.log('  • Inspection Payments History: 5 items (view verified/rejected)');

    await mongoose.connection.close();
    console.log('\n✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Finance Inspection Seed failed:', err);
    try{ if(mongoose.connection.readyState===1) await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

main();
