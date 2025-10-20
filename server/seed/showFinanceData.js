/*
 Finance Manager Portal - Seeded Data Guide
 
 Shows what data was seeded and where to find it in the Finance Portal UI.
 
 Usage:
   node server/seed/showFinanceData.js
*/
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import InspectionEstimate from '../modules/finance/model/inspection_estimation.js';
import Warranty from '../modules/finance/model/warrenty.js';
import WarrantyClaim from '../modules/finance/model/warrenty_claim.js';
import Material from '../modules/supplier/model/material.model.js';
import User from '../modules/auth/model/user.model.js';

async function main(){
  try{
    await connectDB();
    
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║         FINANCE MANAGER PORTAL - SEEDED DATA GUIDE           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // ========== INSPECTION MANAGEMENT ==========
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  INSPECTION MANAGEMENT (Finance Portal → Inspections)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const pendingReqs = await InspectionRequest.find({ 
      propertyLocation_address: /^FIN-PEND-/, 
      status: 'pending' 
    }).select('propertyLocation_address client_name email').lean();
    
    console.log('📋 TAB 1: Pending Inspections (Generate Estimates)');
    console.log('   Items: ' + pendingReqs.length);
    if (pendingReqs.length) {
      pendingReqs.forEach((r, i) => {
        console.log(`   [${i+1}] ${r.propertyLocation_address} (${r.client_name || r.email})`);
      });
      console.log('   ▶ Action: Click "Generate Estimate" to calculate cost based on distance.\n');
    }

    const estHistoryReqs = await InspectionRequest.find({ 
      propertyLocation_address: /^FIN-EST-/, 
      status: 'sent' 
    }).select('propertyLocation_address').lean();
    const estHistoryIds = estHistoryReqs.map(r => r._id);
    const estimates = await InspectionEstimate.find({ 
      inspectionRequestId: { $in: estHistoryIds } 
    }).select('paymentStatus estimatedCost').lean();
    
    console.log('📊 TAB 2: Inspection Estimation History');
    console.log('   Items: ' + estHistoryReqs.length);
    if (estHistoryReqs.length) {
      estHistoryReqs.forEach((r, i) => {
        const est = estimates[i];
        console.log(`   [${i+1}] ${r.propertyLocation_address} - ${est?.estimatedCost || 'N/A'} LKR (status: ${est?.paymentStatus || 'N/A'})`);
      });
      console.log('   ▶ Track: View all sent estimates and their payment statuses.\n');
    }

    const paymentReqs = await InspectionRequest.find({ 
      propertyLocation_address: /^FIN-PAY-/, 
      status: 'sent' 
    }).select('propertyLocation_address client_name').lean();
    const paymentIds = paymentReqs.map(r => r._id);
    const uploadedEsts = await InspectionEstimate.find({ 
      inspectionRequestId: { $in: paymentIds },
      paymentStatus: 'uploaded'
    }).countDocuments();
    
    console.log('💰 TAB 3: Inspection Payments (Verify Receipts)');
    console.log('   Items: ' + uploadedEsts);
    if (paymentReqs.length) {
      paymentReqs.forEach((r, i) => {
        console.log(`   [${i+1}] ${r.propertyLocation_address} (${r.client_name})`);
      });
      console.log('   ▶ Action: Review uploaded payment receipts and verify or reject.\n');
    }

    const historyReqs = await InspectionRequest.find({ 
      propertyLocation_address: /^FIN-HIST-/
    }).select('propertyLocation_address status').lean();
    const historyIds = historyReqs.map(r => r._id);
    const historyEsts = await InspectionEstimate.find({ 
      inspectionRequestId: { $in: historyIds },
      paymentStatus: { $in: ['verified', 'rejected'] }
    }).select('paymentStatus').lean();
    
    console.log('📜 TAB 4: Inspection Payments History');
    console.log('   Items: ' + historyEsts.length);
    if (historyReqs.length) {
      historyReqs.forEach((r, i) => {
        const est = historyEsts[i];
        console.log(`   [${i+1}] ${r.propertyLocation_address} - ${est?.paymentStatus || 'N/A'}`);
      });
      console.log('   ▶ View: All verified/rejected payment records.\n');
    }

    // ========== WARRANTY MANAGEMENT ==========
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  WARRANTY MANAGEMENT (Finance Portal → Warranty)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const warranties = await Warranty.find({})
      .populate('itemId', 'materialName')
      .populate('clientId', 'username email')
      .select('status warrantyEnd')
      .lean();
    
    console.log('🔧 TAB 1: Warranties');
    console.log('   Total Items: ' + warranties.length);
    
    const statusGroups = warranties.reduce((acc, w) => {
      acc[w.status] = (acc[w.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusGroups).forEach(([status, count]) => {
      console.log(`   • ${status}: ${count} items`);
    });
    console.log('   ▶ View: All warranty items with status and expiry dates.\n');

    const pendingClaims = await WarrantyClaim.find({ 
      status: { $in: ['Submitted', 'UnderReview'] } 
    })
      .populate('warrantyId')
      .populate('clientId', 'username email')
      .select('issueDescription status')
      .lean();
    
    console.log('📝 TAB 2: Warranty Requests (Pending Action)');
    console.log('   Items: ' + pendingClaims.length);
    if (pendingClaims.length) {
      pendingClaims.forEach((c, i) => {
        console.log(`   [${i+1}] ${c.status} - "${c.issueDescription}"`);
      });
      console.log('   ▶ Action: Review claims and approve/reject with comments.\n');
    }

    const resolvedClaims = await WarrantyClaim.find({ 
      status: { $in: ['Approved', 'Rejected', 'Replaced'] } 
    })
      .populate('warrantyId')
      .select('status issueDescription')
      .lean();
    
    console.log('📂 TAB 3: Warranty Requests History');
    console.log('   Items: ' + resolvedClaims.length);
    const historyStatusGroups = resolvedClaims.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    Object.entries(historyStatusGroups).forEach(([status, count]) => {
      console.log(`   • ${status}: ${count} claims`);
    });
    console.log('   ▶ View: All resolved warranty claims.\n');

    // ========== SUMMARY ==========
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  QUICK SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('Inspection Management:');
    console.log(`  • ${pendingReqs.length} pending inspections (generate estimates)`);
    console.log(`  • ${estHistoryReqs.length} sent estimates (track status)`);
    console.log(`  • ${uploadedEsts} uploaded receipts (verify payments)`);
    console.log(`  • ${historyEsts.length} payment history (verified/rejected)`);
    
    console.log('\nWarranty Management:');
    console.log(`  • ${warranties.length} total warranties (Active/Claimed/Expired)`);
    console.log(`  • ${pendingClaims.length} pending claims (need approval/rejection)`);
    console.log(`  • ${resolvedClaims.length} resolved claims (history)`);
    
    console.log('\n💡 TIP: Log in to Staff Dashboard as Finance Manager to access');
    console.log('   Finance Portal → Inspection Management');
    console.log('   Finance Portal → Warranty Management\n');

    await mongoose.connection.close();
    process.exit(0);
  }catch(err){
    console.error('Failed:', err);
    try{ if(mongoose.connection.readyState===1) await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

main();
