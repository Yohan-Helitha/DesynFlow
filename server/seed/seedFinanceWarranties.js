/*
 Finance Manager Warranty Management Seed
 Creates diverse warranties and claims to test all finance portal warranty features:
 
 WARRANTIES TAB (10 items):
   - 2 Active warranties (not yet claimed)
   - 2 Active warranties (claimed - should show Claimed status)
   - 2 Expiring soon (within 30 days)
   - 2 Expired (< 90 days ago)
   - 2 Expired (> 90 days ago)
 
 WARRANTY REQUESTS TAB (5 items):
   - 5 warranty claims with status 'Submitted' or 'UnderReview' (pending finance action)
   - Finance manager can approve/reject these
 
 WARRANTY REQUESTS HISTORY TAB (5 items):
   - 5 warranty claims with status 'Approved', 'Rejected', or 'Replaced'
 
 Total: 10 warranties + 10 claims covering all finance manager workflows
 
 Usage:
   node server/seed/seedFinanceWarranties.js
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

async function ensureUsers(){
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

async function ensureMaterials(){
  const defs = [
    { materialId: 'FIN-MAT-001', materialName: 'Premium Door Handle', category: 'Hardware', type: 'Fixture', unit: 'pcs', warrantyPeriod: '365' },
    { materialId: 'FIN-MAT-002', materialName: 'LED Ceiling Light', category: 'Electrical', type: 'Lighting', unit: 'pcs', warrantyPeriod: '730' },
    { materialId: 'FIN-MAT-003', materialName: 'Water Heater', category: 'Plumbing', type: 'Appliance', unit: 'pcs', warrantyPeriod: '1095' },
    { materialId: 'FIN-MAT-004', materialName: 'Floor Tiles', category: 'Flooring', type: 'Material', unit: 'm2', warrantyPeriod: '365' },
    { materialId: 'FIN-MAT-005', materialName: 'Window Blinds', category: 'Interior', type: 'Fixture', unit: 'pcs', warrantyPeriod: '180' },
  ];
  const out = [];
  for (const def of defs){
    let m = await Material.findOne({ materialId: def.materialId });
    if(!m) m = await new Material(def).save();
    out.push(m);
  }
  return out;
}

async function ensureProjects(clients){
  const names = ['Luxury Villa Project', 'Office Complex', 'Residential Apartment', 'Commercial Plaza', 'Smart Home'];
  const out = [];
  for (let i=0; i<names.length; i++){
    let p = await Project.findOne({ projectName: names[i], clientId: clients[i]._id });
    if(!p){
      p = await new Project({ 
        projectName: names[i], 
        clientId: clients[i]._id, 
        status: 'Completed', 
        startDate: daysFromNow(-365),
        dueDate: daysFromNow(-30)
      }).save();
    }
    out.push(p);
  }
  return out;
}

async function cleanup(clients){
  const clientIds = clients.map(c => c._id);
  const warranties = await Warranty.find({ clientId: { $in: clientIds } }).select('_id');
  const wids = warranties.map(w => w._id);
  if (wids.length){
    await WarrantyClaim.deleteMany({ warrantyId: { $in: wids } });
    // Only delete warranties created by this seed (match projects created here)
    const finProjects = await Project.find({ projectName: /Luxury Villa|Office Complex|Residential Apartment|Commercial Plaza|Smart Home/ }).select('_id');
    const finProjIds = finProjects.map(p => p._id);
    await Warranty.deleteMany({ projectId: { $in: finProjIds }, clientId: { $in: clientIds } });
  }
}

async function main(){
  try{
    await connectDB();
    const { clients, finance } = await ensureUsers();
    const materials = await ensureMaterials();
    const projects = await ensureProjects(clients);
    
    console.log(`Using ${clients.length} clients, ${materials.length} materials, ${projects.length} projects\n`);
    
    await cleanup(clients);

    // ========== WARRANTIES (10 total) ==========
    console.log('Creating WARRANTIES...');
    
    const warranties = [];
    let idx = 0;
    
    // 2 Active (not claimed)
    for (let i = 1; i <= 2; i++) {
      const w = await new Warranty({ 
        projectId: projects[idx % projects.length]._id, 
        clientId: clients[idx % clients.length]._id, 
        itemId: materials[idx % materials.length]._id, 
        warrantyStart: daysFromNow(-60), 
        warrantyEnd: daysFromNow(300), 
        status: 'Active' 
      }).save();
      warranties.push(w);
      console.log(`  [${i}] Active (not claimed) - ${materials[idx % materials.length].materialName}`);
      idx++;
    }
    
    // 2 Active (but claimed - will set status to Claimed later)
    for (let i = 1; i <= 2; i++) {
      const w = await new Warranty({ 
        projectId: projects[idx % projects.length]._id, 
        clientId: clients[idx % clients.length]._id, 
        itemId: materials[idx % materials.length]._id, 
        warrantyStart: daysFromNow(-90), 
        warrantyEnd: daysFromNow(200), 
        status: 'Claimed' 
      }).save();
      warranties.push(w);
      console.log(`  [${i+2}] Active (Claimed) - ${materials[idx % materials.length].materialName}`);
      idx++;
    }
    
    // 2 Expiring soon
    for (let i = 1; i <= 2; i++) {
      const w = await new Warranty({ 
        projectId: projects[idx % projects.length]._id, 
        clientId: clients[idx % clients.length]._id, 
        itemId: materials[idx % materials.length]._id, 
        warrantyStart: daysFromNow(-335), 
        warrantyEnd: daysFromNow(25), 
        status: 'Active' 
      }).save();
      warranties.push(w);
      console.log(`  [${i+4}] Expiring soon (<30 days) - ${materials[idx % materials.length].materialName}`);
      idx++;
    }
    
    // 2 Expired (<90 days)
    for (let i = 1; i <= 2; i++) {
      const w = await new Warranty({ 
        projectId: projects[idx % projects.length]._id, 
        clientId: clients[idx % clients.length]._id, 
        itemId: materials[idx % materials.length]._id, 
        warrantyStart: daysFromNow(-400), 
        warrantyEnd: daysFromNow(-30), 
        status: 'Expired' 
      }).save();
      warranties.push(w);
      console.log(`  [${i+6}] Expired (<90 days) - ${materials[idx % materials.length].materialName}`);
      idx++;
    }
    
    // 2 Expired (>90 days)
    for (let i = 1; i <= 2; i++) {
      const w = await new Warranty({ 
        projectId: projects[idx % projects.length]._id, 
        clientId: clients[idx % clients.length]._id, 
        itemId: materials[idx % materials.length]._id, 
        warrantyStart: daysFromNow(-600), 
        warrantyEnd: daysFromNow(-200), 
        status: 'Expired' 
      }).save();
      warranties.push(w);
      console.log(`  [${i+8}] Expired (>90 days) - ${materials[idx % materials.length].materialName}`);
      idx++;
    }

    // ========== WARRANTY REQUESTS - PENDING (5) ==========
    console.log('\nCreating WARRANTY REQUESTS (pending finance action)...');
    const pendingClaims = [];
    const pendingStatuses = ['Submitted', 'Submitted', 'UnderReview', 'UnderReview', 'Submitted'];
    const issues = [
      'Product not functioning properly',
      'Visible defect on surface',
      'Part broken after normal use',
      'Installation issue detected',
      'Quality concern reported'
    ];
    
    for (let i = 0; i < 5; i++) {
      const claim = await new WarrantyClaim({
        warrantyId: warranties[i]._id,
        clientId: clients[i % clients.length]._id,
        issueDescription: issues[i],
        proofUrl: `/uploads/warranty/proofs/fin-claim-pending-${i+1}.jpg`,
        status: pendingStatuses[i]
      }).save();
      pendingClaims.push(claim);
      console.log(`  [${i+1}] ${pendingStatuses[i]} - "${issues[i]}"`);
    }

    // ========== WARRANTY REQUESTS HISTORY - RESOLVED (5) ==========
    console.log('\nCreating WARRANTY REQUESTS HISTORY (resolved)...');
    const historyClaims = [];
    const historyStatuses = ['Approved', 'Approved', 'Rejected', 'Rejected', 'Replaced'];
    const historyIssues = [
      'Approved for replacement',
      'Approved for repair',
      'Not covered under warranty',
      'Insufficient proof provided',
      'Item replaced and shipped'
    ];
    
    for (let i = 0; i < 5; i++) {
      const claim = await new WarrantyClaim({
        warrantyId: warranties[i + 5]._id,
        clientId: clients[i % clients.length]._id,
        issueDescription: historyIssues[i],
        proofUrl: `/uploads/warranty/proofs/fin-claim-history-${i+1}.jpg`,
        status: historyStatuses[i],
        financeReviewerId: finance._id,
        ...(historyStatuses[i] === 'Replaced' && { 
          warehouseAction: { 
            shippedReplacement: true, 
            shippedAt: daysFromNow(-5) 
          } 
        })
      }).save();
      historyClaims.push(claim);
      console.log(`  [${i+1}] ${historyStatuses[i]} - "${historyIssues[i]}"`);
    }

    // ========== SUMMARY ==========
    const [wCount, cPendingCount, cHistoryCount] = await Promise.all([
      Warranty.countDocuments({ _id: { $in: warranties.map(w => w._id) } }),
      WarrantyClaim.countDocuments({ _id: { $in: pendingClaims.map(c => c._id) } }),
      WarrantyClaim.countDocuments({ _id: { $in: historyClaims.map(c => c._id) } })
    ]);

    console.log('\n=== FINANCE WARRANTY SEED COMPLETE ===');
    console.log(`Total Warranties: ${wCount} (expected 10)`);
    console.log(`Total Pending Claims: ${cPendingCount} (expected 5)`);
    console.log(`Total History Claims: ${cHistoryCount} (expected 5)`);
    console.log('\nFinance Portal → Warranty Management:');
    console.log('  • Warranties tab: 10 items (Active/Claimed/Expiring/Expired)');
    console.log('  • Warranty Requests tab: 5 items (Submitted/UnderReview - can approve/reject)');
    console.log('  • Warranty Requests History tab: 5 items (Approved/Rejected/Replaced)');

    await mongoose.connection.close();
    console.log('\n✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Finance Warranty Seed failed:', err);
    try{ if(mongoose.connection.readyState===1) await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

main();
