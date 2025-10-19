/*
 Verify Finance Manager Workflow Seeds
 Shows what data is available for testing finance features
 
 Usage:
   node server/seed/verifyFinanceSeeds.js
*/
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import InspectionEstimation from '../modules/finance/model/inspection_estimation.js';
import Warranty from '../modules/finance/model/warrenty.js';
import WarrantyClaim from '../modules/finance/model/warrenty_claim.js';

async function main() {
  try {
    await connectDB();
    
    console.log('\n📊 Finance Manager Workflow Data Verification\n');
    console.log('=' .repeat(60));
    
    // Inspection Workflow
    console.log('\n🔍 INSPECTION MANAGEMENT\n');
    
    const pendingReqs = await InspectionRequest.find({ 
      propertyLocation_address: /^FM-INS-/, 
      status: 'pending' 
    }).select('propertyLocation_address propertyType number_of_room').lean();
    
    const sentReqs = await InspectionRequest.find({ 
      propertyLocation_address: /^FM-INS-/, 
      status: 'sent' 
    }).select('propertyLocation_address _id').lean();
    
    const verifiedReqs = await InspectionRequest.find({ 
      propertyLocation_address: /^FM-INS-/, 
      status: 'verified' 
    }).select('propertyLocation_address').lean();
    
    const rejectedReqs = await InspectionRequest.find({ 
      propertyLocation_address: /^FM-INS-/, 
      status: 'assigned' 
    }).select('propertyLocation_address').lean();
    
    // Get estimations by payment status
    const allFmReqs = await InspectionRequest.find({ propertyLocation_address: /^FM-INS-/ }).select('_id').lean();
    const fmReqIds = allFmReqs.map(r => r._id);
    
    const pendingPayment = await InspectionEstimation.find({ 
      inspectionRequestId: { $in: fmReqIds }, 
      paymentStatus: 'pending' 
    }).countDocuments();
    
    const uploadedReceipts = await InspectionEstimation.find({ 
      inspectionRequestId: { $in: fmReqIds }, 
      paymentStatus: 'uploaded' 
    }).countDocuments();
    
    const verifiedPayments = await InspectionEstimation.find({ 
      inspectionRequestId: { $in: fmReqIds }, 
      paymentStatus: 'verified' 
    }).countDocuments();
    
    const rejectedPayments = await InspectionEstimation.find({ 
      inspectionRequestId: { $in: fmReqIds }, 
      paymentStatus: 'rejected' 
    }).countDocuments();
    
    console.log(`1. PENDING INSPECTIONS (Generate Estimate): ${pendingReqs.length}`);
    pendingReqs.forEach((r, i) => console.log(`   [${i+1}] ${r.propertyLocation_address} - ${r.propertyType} (${r.number_of_room} rooms)`));
    
    console.log(`\n2. ESTIMATIONS SENT (Awaiting Payment): ${pendingPayment}`);
    
    console.log(`\n3. PAYMENT RECEIPTS UPLOADED (Verify): ${uploadedReceipts}`);
    const uploaded = await InspectionRequest.find({ propertyLocation_address: /FM-INS-0[678]/ }).select('propertyLocation_address').lean();
    uploaded.forEach((r, i) => console.log(`   [${i+1}] ${r.propertyLocation_address}`));
    
    console.log(`\n4. VERIFIED PAYMENTS: ${verifiedPayments}`);
    verifiedReqs.forEach((r, i) => console.log(`   [${i+1}] ${r.propertyLocation_address}`));
    
    console.log(`\n5. REJECTED PAYMENTS: ${rejectedPayments}`);
    rejectedReqs.forEach((r, i) => console.log(`   [${i+1}] ${r.propertyLocation_address}`));
    
    // Warranty Claims Workflow
    console.log('\n\n🛡️  WARRANTY MANAGEMENT\n');
    
    const fmWarranties = await Warranty.find({}).populate('itemId').lean();
    const fmWarrantyItems = fmWarranties.filter(w => w.itemId?.materialId?.startsWith('FM-MAT-'));
    const fmWarrantyIds = fmWarrantyItems.map(w => w._id);
    
    const submittedClaims = await WarrantyClaim.find({ 
      warrantyId: { $in: fmWarrantyIds }, 
      status: 'Submitted' 
    }).populate('warrantyId').lean();
    
    const underReviewClaims = await WarrantyClaim.find({ 
      warrantyId: { $in: fmWarrantyIds }, 
      status: 'UnderReview' 
    }).populate('warrantyId').lean();
    
    const approvedClaims = await WarrantyClaim.find({ 
      warrantyId: { $in: fmWarrantyIds }, 
      status: 'Approved' 
    }).populate('warrantyId').lean();
    
    const rejectedClaims = await WarrantyClaim.find({ 
      warrantyId: { $in: fmWarrantyIds }, 
      status: 'Rejected' 
    }).countDocuments();
    
    const replacedClaims = await WarrantyClaim.find({ 
      warrantyId: { $in: fmWarrantyIds }, 
      status: 'Replaced' 
    }).countDocuments();
    
    console.log(`1. SUBMITTED CLAIMS (Review): ${submittedClaims.length}`);
    for (const c of submittedClaims.slice(0, 4)) {
      const item = await Warranty.findById(c.warrantyId).populate('itemId');
      console.log(`   • ${item?.itemId?.materialName || 'Unknown'}: ${c.issueDescription.substring(0, 50)}...`);
    }
    
    console.log(`\n2. UNDER REVIEW (Investigating): ${underReviewClaims.length}`);
    for (const c of underReviewClaims) {
      const item = await Warranty.findById(c.warrantyId).populate('itemId');
      console.log(`   • ${item?.itemId?.materialName || 'Unknown'}: ${c.issueDescription.substring(0, 50)}...`);
    }
    
    console.log(`\n3. APPROVED (Ready for Warehouse): ${approvedClaims.length}`);
    for (const c of approvedClaims) {
      const item = await Warranty.findById(c.warrantyId).populate('itemId');
      console.log(`   • ${item?.itemId?.materialName || 'Unknown'}: ${c.issueDescription.substring(0, 50)}...`);
    }
    
    console.log(`\n4. REJECTED CLAIMS: ${rejectedClaims}`);
    console.log(`\n5. REPLACED (Completed): ${replacedClaims}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Verification Complete!\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    try {
      if (mongoose.connection.readyState === 1) await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

main();
