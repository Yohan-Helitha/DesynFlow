import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Warranty from '../modules/finance/model/warrenty.js';
import WarrantyClaim from '../modules/finance/model/warrenty_claim.js';
import Project from '../modules/project/model/project.model.js';
import User from '../modules/auth/model/user.model.js';
import Material from '../modules/supplier/model/material.model.js';

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const issueDescriptions = [
  'Paint peeling off on exterior walls after 6 months',
  'Cracks appearing in ceramic tiles in bathroom',
  'Water leakage from roof during heavy rain',
  'Door hinges becoming loose and making squeaking noise',
  'Electrical outlet not working properly',
  'Window glass has scratches and defects',
  'Floor tiles lifting up in living room area',
  'Paint bubbling on ceiling due to moisture',
  'Wooden door frame showing signs of termite damage',
  'Plumbing fixtures leaking at joints'
];

(async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ Connected!\n');

    console.log('📊 Fetching data...');
    const [projects, clients, materials, financeUsers] = await Promise.all([
      Project.find({}).limit(10).lean(),
      User.find({ role: 'client' }).limit(10).lean(),
      Material.find({}).limit(15).lean(),
      User.find({ role: 'finance' }).limit(5).lean()
    ]);

    console.log(`✅ Projects: ${projects.length}, Clients: ${clients.length}, Materials: ${materials.length}\n`);

    if (!projects.length || !clients.length || !materials.length) {
      console.log('❌ Missing prerequisite data!');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('🗑️  Clearing old data...');
    await Warranty.deleteMany({});
    await WarrantyClaim.deleteMany({});
    console.log('✅ Cleared!\n');

    console.log('🛡️  Creating warranties...');
    const warranties = [];
    const now = new Date();

    projects.forEach((project, idx) => {
      const client = clients[idx % clients.length];
      const numWarranties = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < numWarranties; i++) {
        const material = materials[(idx * 3 + i) % materials.length];
        const startMonthsAgo = 3 + Math.floor(Math.random() * 18);
        const durationMonths = 12 + Math.floor(Math.random() * 24);
        
        const startDate = addMonths(now, -startMonthsAgo);
        const endDate = addMonths(startDate, durationMonths);
        
        let status = endDate > now ? 'Active' : 'Expired';
        const rand = Math.random();
        if (rand < 0.05 && status === 'Active') status = 'Claimed';
        if (rand < 0.02 && status === 'Active') status = 'Replaced';

        warranties.push({
          projectId: project._id,
          clientId: client._id,
          itemId: material._id,
          warrantyStart: startDate,
          warrantyEnd: endDate,
          status
        });
      }
    });

    const insertedWarranties = await Warranty.insertMany(warranties);
    console.log(`✅ Created ${insertedWarranties.length} warranties!\n`);

    console.log('📝 Creating warranty claims...');
    const claims = [];
    const activeWarranties = insertedWarranties.filter(w => w.status === 'Active' || w.status === 'Expired');
    const numClaims = Math.floor(activeWarranties.length * 0.3);

    for (let i = 0; i < numClaims; i++) {
      const warranty = activeWarranties[i % activeWarranties.length];
      const daysAfterStart = Math.floor(Math.random() * 180);
      const claimDate = addDays(warranty.warrantyStart, daysAfterStart);

      const statusRand = Math.random();
      let claimStatus, reviewerId = null, warehouseAction = { shippedReplacement: false };

      if (statusRand < 0.2) {
        claimStatus = 'Submitted';
      } else if (statusRand < 0.4) {
        claimStatus = 'UnderReview';
        reviewerId = financeUsers[i % financeUsers.length]?._id;
      } else if (statusRand < 0.6) {
        claimStatus = 'Approved';
        reviewerId = financeUsers[i % financeUsers.length]?._id;
      } else if (statusRand < 0.8) {
        claimStatus = 'Rejected';
        reviewerId = financeUsers[i % financeUsers.length]?._id;
      } else {
        claimStatus = 'Replaced';
        reviewerId = financeUsers[i % financeUsers.length]?._id;
        warehouseAction = {
          shippedReplacement: true,
          shippedAt: addDays(claimDate, 5 + Math.floor(Math.random() * 10))
        };
      }

      claims.push({
        warrantyId: warranty._id,
        clientId: warranty.clientId,
        issueDescription: issueDescriptions[i % issueDescriptions.length],
        proofUrl: Math.random() < 0.7 ? `/uploads/warranty-proof-${i + 1}.pdf` : null,
        status: claimStatus,
        financeReviewerId: reviewerId,
        warehouseAction,
        createdAt: claimDate,
        updatedAt: addDays(claimDate, Math.floor(Math.random() * 5))
      });
    }

    const insertedClaims = await WarrantyClaim.insertMany(claims);
    console.log(`✅ Created ${insertedClaims.length} claims!\n`);

    console.log('📊 Summary:');
    const statusCount = insertedWarranties.reduce((acc, w) => {
      acc[w.status] = (acc[w.status] || 0) + 1;
      return acc;
    }, {});
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n✅ Seeding completed!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
