/*
Verifies seeded data and prints the active database name and counts.
Usage:
  node server/seed/verifySeed.js
*/
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import User from '../modules/auth/model/user.model.js';
import InspectionEstimate from '../modules/finance/model/inspection_estimation.js';
import Warranty from '../modules/finance/model/warrenty.js';
import WarrantyClaim from '../modules/finance/model/warrenty_claim.js';

async function main(){
  try{
    await connectDB();
    const dbName = mongoose.connection?.db?.databaseName;

    const email = 'john.anderson@email.com';
    const client = await User.findOne({ email }).select('_id');
    const reqs = await InspectionRequest.find({ client_ID: client?._id }).select('propertyLocation_address status createdAt');
    const reqIds = reqs.map(r => r._id);
    const estCount = await InspectionEstimate.countDocuments({ inspectionRequestId: { $in: reqIds } });
    
    let warranties = [];
    let claims = [];
    if (client) {
      warranties = await Warranty.find({ clientId: client._id }).limit(5).select('clientId projectId itemId status warrantyEnd');
      claims = await WarrantyClaim.find({ warrantyId: { $in: warranties.map(w => w._id) } }).select('status warrantyId');
    }

    console.log(`\nConnected DB: ${dbName}`);
    console.log(`InspectionRequests for ${email}: ${reqs.length}`);
    reqs.forEach((r, i) => console.log(`  [${i+1}] ${r.propertyLocation_address} — ${r.status}`));
    console.log(`InspectionEstimations linked: ${estCount}`);
  console.log(`Warranties for ${email} (sample up to 5): ${warranties.length}`);
  console.log(`Claims for those warranties: ${claims.length}`);

    await mongoose.connection.close();
    process.exit(0);
  }catch(err){
    console.error('Verify failed:', err);
    try{ if(mongoose.connection.readyState===1) await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

main();
