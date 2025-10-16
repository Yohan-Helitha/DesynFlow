import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Warranty from '../modules/finance/model/warrenty.js';
import WarrantyClaim from '../modules/finance/model/warrenty_claim.js';
import Project from '../modules/project/model/project.model.js';
import User from '../modules/auth/model/user.model.js';
import Material from '../modules/supplier/model/material.model.js';

const mongoURI = process.env.MONGO_URI;

(async function checkData() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    const [projects, materials, clients, warranties, claims] = await Promise.all([
      Project.countDocuments(),
      Material.countDocuments(),
      User.countDocuments({ role: 'client' }),
      Warranty.countDocuments(),
      WarrantyClaim.countDocuments()
    ]);

    console.log('📊 Database Status:');
    console.log(`   Projects: ${projects}`);
    console.log(`   Materials: ${materials}`);
    console.log(`   Clients: ${clients}`);
    console.log(`   Warranties: ${warranties}`);
    console.log(`   Warranty Claims: ${claims}\n`);

    if (warranties > 0) {
      console.log('📋 Sample Warranties:');
      const sampleWarranties = await Warranty.find({})
        .limit(3)
        .populate('projectId', 'projectName')
        .populate('clientId', 'username')
        .populate('itemId', 'materialName');
      
      sampleWarranties.forEach((w, i) => {
        console.log(`\n   ${i + 1}. Warranty ${w._id}:`);
        console.log(`      Project: ${w.projectId?.projectName || 'N/A'}`);
        console.log(`      Client: ${w.clientId?.username || 'N/A'}`);
        console.log(`      Item: ${w.itemId?.materialName || 'N/A'}`);
        console.log(`      Status: ${w.status}`);
        console.log(`      Period: ${w.warrantyStart?.toISOString().split('T')[0]} - ${w.warrantyEnd?.toISOString().split('T')[0]}`);
      });
    }

    if (claims > 0) {
      console.log('\n\n📋 Sample Warranty Claims:');
      const sampleClaims = await WarrantyClaim.find({})
        .limit(3)
        .populate('warrantyId')
        .populate('clientId', 'username');
      
      sampleClaims.forEach((c, i) => {
        console.log(`\n   ${i + 1}. Claim ${c._id}:`);
        console.log(`      Warranty ID: ${c.warrantyId?._id || 'Not linked'}`);
        console.log(`      Client: ${c.clientId?.username || 'N/A'}`);
        console.log(`      Status: ${c.status}`);
        console.log(`      Issue: ${c.issueDescription?.substring(0, 50) || 'N/A'}...`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
