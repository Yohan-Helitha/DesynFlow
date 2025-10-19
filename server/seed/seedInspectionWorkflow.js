/*
 Seed Inspection Management workflow data.
 - Creates a few InspectionRequests across statuses
 - Creates matching InspectionEstimation docs to exercise pending/uploaded/verified/rejected flows
 Usage (from repo root):
   node server/seed/seedInspectionWorkflow.js
*/

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../modules/auth/model/user.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import InspectionEstimation from '../modules/finance/model/inspection_estimation.js';

dotenv.config();

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

async function ensureClientAndFinance(){
  let client = await User.findOne({ role: 'client' });
  if(!client){
    client = await new User({
      username: 'workflowClient',
      email: `workflow.client+${Date.now()}@example.com`,
      password: 'Password@123',
      phone: '0771234567',
      role: 'client',
      isVerified: true,
      isActive: true
    }).save();
  }
  let finance = await User.findOne({ role: /finance/i });
  if(!finance){
    finance = await new User({
      username: 'workflowFinance',
      email: `workflow.finance+${Date.now()}@example.com`,
      password: 'Admin@123',
      phone: '0711234567',
      role: 'finance manager',
      isVerified: true,
      isActive: true
    }).save();
  }
  return { client, finance };
}

const cities = ['Colombo','Kandy','Galle','Negombo'];
const streets = ['Galle Road','Duplication Rd','Baseline Rd','Temple Rd'];

async function createRequests(client){
  const base = Date.now();
  const statuses = ['pending','sent','verified','assigned','in-progress','completed'];
  const docs = [];
  for(let i=0;i<8;i++){
    const status = statuses[i % statuses.length];
    const req = new InspectionRequest({
      client_ID: client._id,
      client_name: client.username || client.name || client.email,
      email: client.email,
      phone_number: client.phone || '0770000000',
      propertyLocation_address: `${randInt(1,300)} ${pick(streets)}`,
      propertyLocation_city: pick(cities),
      propertyType: pick(['residential','commercial','apartment']),
      number_of_floor: randInt(1,3),
      number_of_room: randInt(3,8),
      room_name: ['Living Room','Kitchen','Bedroom'],
      inspection_date: new Date(base - randInt(1,15)*24*3600*1000),
      status,
    });
    docs.push(await req.save());
  }
  return docs;
}

async function createEstimations(requests, finance){
  const created = [];
  for(const req of requests){
    // Only attach estimations to non-pending
    if(req.status === 'pending') continue;
    const distance = randInt(5,80);
    const estimatedCost = 5000 + distance*50 + req.number_of_room*1000;
    const est = await InspectionEstimation.findOneAndUpdate(
      { inspectionRequestId: String(req._id) },
      { $set: { distanceKm: distance, estimatedCost }, $setOnInsert: { createdBy: finance._id, paymentStatus: 'pending' } },
      { new: true, upsert: true }
    );
    // Assign varied payment states
    if(req.status === 'sent'){
      // keep pending
    } else if(req.status === 'verified' || req.status === 'completed'){
      // mark uploaded or verified
      const roll = Math.random();
      if(roll < 0.5){
        await InspectionEstimation.findByIdAndUpdate(est._id, { paymentStatus: 'uploaded', paymentReceiptUrl: `/uploads/inspection_payments/${Date.now()}-${Math.floor(Math.random()*1e6)}.pdf` });
      } else {
        await InspectionEstimation.findByIdAndUpdate(est._id, { paymentStatus: 'verified', paymentAmount: estimatedCost });
      }
    } else if(req.status === 'assigned' || req.status === 'in-progress'){
      // sometimes rejected
      const roll = Math.random();
      if(roll < 0.25){
        await InspectionEstimation.findByIdAndUpdate(est._id, { paymentStatus: 'rejected', paymentAmount: Math.max(0, estimatedCost-1000) });
      }
    }
    created.push(est);
  }
  return created;
}

async function main(){
  try{
    await connectDB();
    const { client, finance } = await ensureClientAndFinance();
    const requests = await createRequests(client);
    const estimations = await createEstimations(requests, finance);

    console.log(`\nSeeded Inspection Workflow:`);
    console.log(`  Requests: ${requests.length}`);
    console.log(`  Estimations: ${estimations.length}`);

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
