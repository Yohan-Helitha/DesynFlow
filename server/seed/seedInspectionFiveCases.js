/*
 Minimal deterministic seed for Inspection Management.
 Creates exactly 5 requests and matching estimations to validate each core state:
 1) pending (no estimation)
 2) sent + estimation pending payment
 3) sent + estimation uploaded (receipt)
 4) verified + estimation verified
 5) assigned + estimation rejected

 Usage:
   node server/seed/seedInspectionFiveCases.js
*/
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../modules/auth/model/user.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import InspectionEstimation from '../modules/finance/model/inspection_estimation.js';

dotenv.config();

async function ensureUsers(){
  // Use existing client from DB (john.anderson@email.com is first client in system)
  let client = await User.findOne({ email: 'john.anderson@email.com', role: 'client' });
  if(!client){
    // Fallback: find any client, or create one
    client = await User.findOne({ role: 'client' });
    if (!client) {
      client = await new User({
        username: 'johnAnderson',
        email: 'john.anderson@email.com',
        password: 'Password@123',
        phone: '0771000000',
        role: 'client', isVerified: true, isActive: true
      }).save();
    }
  }
  let finance = await User.findOne({ role: /finance/i });
  if(!finance){
    finance = await new User({
      username: 'financeUser',
      email: 'finance@desynflow.com',
      password: 'Admin@123',
      phone: '0711000000',
      role: 'finance manager', isVerified: true, isActive: true
    }).save();
  }
  return { client, finance };
}

function reqDoc(client, overrides){
  return new InspectionRequest({
    client_ID: client._id,
    client_name: client.username || client.name || client.email,
    email: client.email,
    phone_number: client.phone || '0770000000',
    propertyLocation_address: overrides.address || '123 Test Street',
    propertyLocation_city: overrides.city || 'Colombo',
    propertyType: overrides.propertyType || 'residential',
    number_of_floor: 1,
    number_of_room: 3,
    room_name: ['Living Room','Kitchen','Bedroom'],
    status: overrides.status || 'pending',
    inspection_date: new Date(),
  });
}

async function upsertEst(inspectionRequestId, data){
  const update = { $set: data };
  if (!Object.prototype.hasOwnProperty.call(data, 'paymentStatus')) {
    update.$setOnInsert = { paymentStatus: 'pending' };
  }
  return InspectionEstimation.findOneAndUpdate(
    { inspectionRequestId: inspectionRequestId },
    update,
    { new: true, upsert: true }
  );
}

async function main(){
  try{
    await connectDB();
    const { client, finance } = await ensureUsers();

    // Clean previous five-case docs for repeatability (by marker email)
    const prevReqs = await InspectionRequest.find({ email: client.email, propertyLocation_address: /^[1-5] (Pending|PendingPay|Uploaded|Verified|Rejected)/ }).select('_id');
    if (prevReqs.length) {
      const ids = prevReqs.map(r => r._id);
      await InspectionEstimation.deleteMany({ inspectionRequestId: { $in: ids } });
      await InspectionRequest.deleteMany({ _id: { $in: ids } });
    }

    // 1) pending (no estimation)
    const r1 = await reqDoc(client, { status: 'pending', address: '1 Pending Way' }).save();

    // 2) sent + estimation pending payment
    const r2 = await reqDoc(client, { status: 'sent', address: '2 PendingPay Ave' }).save();
    await upsertEst(r2._id, { distanceKm: 20, estimatedCost: 12000, createdBy: finance._id, paymentStatus: 'pending' });

    // 3) sent + estimation uploaded (receipt)
    const r3 = await reqDoc(client, { status: 'sent', address: '3 Uploaded Rd' }).save();
    await upsertEst(r3._id, { distanceKm: 35, estimatedCost: 17000, createdBy: finance._id, paymentStatus: 'uploaded', paymentReceiptUrl: `/uploads/inspection_payments/${Date.now()}-receipt.pdf` });

    // 4) verified + estimation verified
    const r4 = await reqDoc(client, { status: 'verified', address: '4 Verified St' }).save();
    await upsertEst(r4._id, { distanceKm: 15, estimatedCost: 10000, createdBy: finance._id, paymentStatus: 'verified', paymentAmount: 10000 });

    // 5) assigned + estimation rejected
    const r5 = await reqDoc(client, { status: 'assigned', address: '5 Rejected Ln' }).save();
    await upsertEst(r5._id, { distanceKm: 10, estimatedCost: 9000, createdBy: finance._id, paymentStatus: 'rejected', paymentAmount: 8000 });

    const reqIds = [r1._id, r2._id, r3._id, r4._id, r5._id];
    const [reqCount, estCount] = await Promise.all([
      InspectionRequest.countDocuments({ _id: { $in: reqIds } }),
      InspectionEstimation.countDocuments({ inspectionRequestId: { $in: reqIds } })
    ]);

    console.log(`\nSeeded minimal five cases:`);
    console.log(`  Requests: ${reqCount} (expected 5)`);
    console.log(`  Estimations: ${estCount} (expected 4)`);

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Seed failed:', err);
    try{ if(mongoose.connection.readyState===1) await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

main();
