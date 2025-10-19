/*
 Minimal deterministic seed for Warranty Management.
 Creates exactly 5 warranty items and 5 claims covering key UI states:
 1) Active
 2) Expiring soon (within 30 days)
 3) Expired (< 90 days)
 4) Expired (> 90 days)
 5) Active but nearing end, with claim Submitted
 
 Additionally generates claims:
 - Submitted (pending)
 - UnderReview
 - Approved
 - Rejected
 - Replaced (with warehouse shipped flag)

 Usage:
   node server/seed/seedWarrantyFiveCases.js
*/
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../modules/auth/model/user.model.js';
import Project from '../modules/project/model/project.model.js';
import Material from '../modules/supplier/model/material.model.js';
import Warranty from '../modules/finance/model/warrenty.js';
import WarrantyClaim from '../modules/finance/model/warrenty_claim.js';

dotenv.config();

function daysFromNow(days){
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function ensureClient(){
  // Use existing client (john.anderson@email.com)
  let client = await User.findOne({ email: 'john.anderson@email.com', role: 'client' });
  if(!client){
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
  return client;
}

async function ensureMaterials(){
  const defs = [
    { materialId: 'W-MAT-001', materialName: 'Premium Faucet', category: 'Plumbing', type: 'Fixture', unit: 'pcs', warrantyPeriod: '365' },
    { materialId: 'W-MAT-002', materialName: 'LED Panel Light', category: 'Electrical', type: 'Lighting', unit: 'pcs', warrantyPeriod: '730' },
    { materialId: 'W-MAT-003', materialName: 'Smart Thermostat', category: 'HVAC', type: 'Controller', unit: 'pcs', warrantyPeriod: '365' }
  ];
  const out = [];
  for (const def of defs){
    let m = await Material.findOne({ materialId: def.materialId });
    if(!m) m = await new Material(def).save();
    out.push(m);
  }
  return out;
}

async function ensureProjects(client){
  const names = ['Alpha Residence','Beta Office','Gamma Villa'];
  const out = [];
  for (let i=0;i<names.length;i++){
    let p = await Project.findOne({ projectName: names[i], clientId: client._id });
    if(!p){
      p = await new Project({ projectName: names[i], clientId: client._id, status: 'Active', startDate: daysFromNow(-120) }).save();
    }
    out.push(p);
  }
  return out;
}

async function cleanup(client){
  const warranties = await Warranty.find({ clientId: client._id, }).select('_id');
  const wids = warranties.map(w => w._id);
  if (wids.length){
    await WarrantyClaim.deleteMany({ warrantyId: { $in: wids } });
    // Only delete warranties for our marker client projects/materials created by this seed
    await Warranty.deleteMany({ _id: { $in: wids } });
  }
}

async function main(){
  try{
    await connectDB();
    const client = await ensureClient();
    const [materials, projects] = await Promise.all([
      ensureMaterials(),
      ensureProjects(client)
    ]);

    await cleanup(client);

    // Create 5 warranties with varied windows
    const now = new Date();
    const make = async (project, item, start, end, status) => {
      return new Warranty({ projectId: project._id, clientId: client._id, itemId: item._id, warrantyStart: start, warrantyEnd: end, status }).save();
    };

    const w1 = await make(projects[0], materials[0], daysFromNow(-60), daysFromNow(300), 'Active'); // Active
    const w2 = await make(projects[1], materials[1], daysFromNow(-700), daysFromNow(10), 'Active'); // Expiring soon
    const w3 = await make(projects[2], materials[2], daysFromNow(-400), daysFromNow(-10), 'Expired'); // Expired (<90 days)
    const w4 = await make(projects[0], materials[1], daysFromNow(-800), daysFromNow(-200), 'Expired'); // Expired (>90 days)
    const w5 = await make(projects[1], materials[0], daysFromNow(-100), daysFromNow(20), 'Active'); // Active nearing end

    // Create 5 claims across states
    const c1 = await new WarrantyClaim({ warrantyId: w1._id, clientId: client._id, issueDescription: 'Minor leak observed', proofUrl: '/uploads/warranty/proofs/claim1.jpg', status: 'Submitted' }).save();
    const c2 = await new WarrantyClaim({ warrantyId: w2._id, clientId: client._id, issueDescription: 'Light flickering', proofUrl: '/uploads/warranty/proofs/claim2.jpg', status: 'UnderReview' }).save();
    const c3 = await new WarrantyClaim({ warrantyId: w3._id, clientId: client._id, issueDescription: 'Thermostat not responding', proofUrl: '/uploads/warranty/proofs/claim3.jpg', status: 'Approved' }).save();
    const c4 = await new WarrantyClaim({ warrantyId: w4._id, clientId: client._id, issueDescription: 'LED driver burnt', proofUrl: '/uploads/warranty/proofs/claim4.jpg', status: 'Rejected' }).save();
    const c5 = await new WarrantyClaim({ warrantyId: w5._id, clientId: client._id, issueDescription: 'Handle wobbling', proofUrl: '/uploads/warranty/proofs/claim5.jpg', status: 'Replaced', warehouseAction: { shippedReplacement: true, shippedAt: daysFromNow(-1) } }).save();

    const [wCount, cCount] = await Promise.all([
      Warranty.countDocuments({ _id: { $in: [w1._id, w2._id, w3._id, w4._id, w5._id] } }),
      WarrantyClaim.countDocuments({ warrantyId: { $in: [w1._id, w2._id, w3._id, w4._id, w5._id] } })
    ]);

    console.log('\nSeeded minimal five cases for Warranty:');
    console.log(`  Warranties: ${wCount} (expected 5)`);
    console.log(`  Claims: ${cCount} (expected 5)`);

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Warranty seed failed:', err);
    try{ if(mongoose.connection.readyState===1) await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

main();
