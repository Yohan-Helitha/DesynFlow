/*
Query existing users and show test client credentials for UI login.
Usage:
  node server/seed/showTestCredentials.js
*/
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../modules/auth/model/user.model.js';

async function main(){
  try{
    await connectDB();
    
    const clients = await User.find({ role: 'client' }).select('username email role isActive createdAt').limit(5).lean();
    const johnClient = clients.find(c => c.email === 'john.anderson@email.com');
    
    console.log('\n=== Test Credentials for UI ===\n');
    
    if (johnClient) {
      console.log('✅ Primary Test Client (for Both UIs):');
      console.log(`  Email: john.anderson@email.com`);
      console.log(`  Password: Password@123 (default for seeded users)`);
      console.log(`  Role: ${johnClient.role}`);
      console.log(`  Active: ${johnClient.isActive}`);
      console.log(`  Created: ${johnClient.createdAt}`);
    } else {
      console.log('⚠️  Primary test client (john.anderson@email.com) not found!');
    }
    
    console.log('\n--- All Client Users (sample up to 5) ---');
    clients.forEach((c, i) => {
      console.log(`[${i+1}] ${c.email} (${c.username || 'N/A'}) — ${c.role} — Active: ${c.isActive}`);
    });
    
    console.log('\n💡 CLIENT PORTAL:');
    console.log('   1. Log in with: john.anderson@email.com / Password@123');
    console.log('   2. Navigate to Profile → Warranty tab');
    console.log('   3. You should see:');
    console.log('      • "Your Items" tab: 5 warranty items (Active/Expired states)');
    console.log('      • "Your Claims" tab: 5 claims (Submitted/UnderReview/Approved/Rejected/Replaced)');
    console.log('\n💡 STAFF DASHBOARD (Finance Portal):');
    console.log('   1. Log in as finance user');
    console.log('   2. Navigate to Finance Portal → Inspection Management');
    console.log('   3. You should see 5 inspection requests:');
    console.log('      • Pending tab: "1 Pending Way"');
    console.log('      • Estimations sent: "2 PendingPay Ave" (paymentStatus: pending)');
    console.log('      • Payments with receipt: "3 Uploaded Rd" (paymentStatus: uploaded)');
    console.log('      • History/Verified: "4 Verified St", "5 Rejected Ln"');
    console.log('   Note: Staff dashboard shows ALL inspection records (no user filter).\n');

    await mongoose.connection.close();
    process.exit(0);
  }catch(err){
    console.error('Failed:', err);
    try{ if(mongoose.connection.readyState===1) await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

main();
