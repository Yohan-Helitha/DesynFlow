import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Models
import Warranty from '../modules/finance/model/warrenty.js';
import WarrantyClaim from '../modules/finance/model/warrenty_claim.js';
import Project from '../modules/project/model/project.model.js';
import User from '../modules/auth/model/user.model.js';
import Material from '../modules/supplier/model/material.model.js';

const mongoURI = process.env.MONGO_URI;

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function durationFromWarrantyPeriodStr(periodStr) {
  if (!periodStr) return 12; // default 12 months if undefined
  const lower = String(periodStr).toLowerCase();
  // Expect formats like '5 years', '10 years', '2 year', '24 months'
  const yearMatch = lower.match(/(\d+)\s*year/);
  if (yearMatch) return Number(yearMatch[1]) * 12;
  const monthMatch = lower.match(/(\d+)\s*month/);
  if (monthMatch) return Number(monthMatch[1]);
  // Fallback
  const num = parseInt(lower, 10);
  return Number.isFinite(num) ? num : 12;
}

async function seedWarrantyModels() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Fetching related data...');
    const [projects, clients, materials] = await Promise.all([
      Project.find({}).lean(),
      User.find({ role: 'client' }).lean(),
      Material.find({}).lean(),
    ]);

    if (!projects.length || !clients.length || !materials.length) {
      console.log('❌ Missing base data (projects/clients/materials). Run seedComprehensiveData.js first.');
      process.exit(1);
    }

    console.log(`Found ${projects.length} projects, ${clients.length} clients, ${materials.length} materials`);

    // Clear existing warranties but keep claims (they may link to new warranties below)
    console.log('🗑️ Clearing existing warranties...');
    await Warranty.deleteMany({});
    console.log('✅ Cleared Warranty collection');

    // Build warranties per project for selected finished-product materials (have warrantyPeriod)
    console.log('\n🛡️ Creating warranties for delivered items...');
    const warrantyDocs = [];

    // Choose a subset of materials with a warrantyPeriod
    const warrantableMaterials = materials.filter(m => m.warrantyPeriod);
    const now = new Date();

    projects.forEach((project, idx) => {
      const client = clients.find(c => String(c._id) === String(project.clientId)) || clients[idx % clients.length];
      // Create 1-3 warranties per project
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const material = warrantableMaterials[(idx + i) % warrantableMaterials.length];
        const durationMonths = durationFromWarrantyPeriodStr(material?.warrantyPeriod);
        // Purchase/install happened within last 18 months
        const startOffsetMonths = Math.floor(Math.random() * 18);
        const startDate = addMonths(now, -startOffsetMonths);
        const endDate = addMonths(startDate, durationMonths);

        // Determine status relative to now
        let status = 'Active';
        if (endDate < now) status = 'Expired';

        warrantyDocs.push({
          projectId: project._id,
          clientId: client?._id || project.clientId,
          itemId: material._id,
          warrantyStart: startDate,
          warrantyEnd: endDate,
          status,
        });
      }
    });

    const warranties = await Warranty.insertMany(warrantyDocs);
    console.log(`✅ Inserted ${warranties.length} warranties`);

    // Optionally align some WarrantyClaims to reference created warranties
    console.log('\n🔗 Linking existing warranty claims to warranties when possible...');
    const claims = await WarrantyClaim.find({}).lean();
    if (claims.length) {
      const updates = [];
      for (let i = 0; i < claims.length; i++) {
        const claim = claims[i];
        // Try to link by same client and nearest warranty by createdAt
        const candidate = warranties.find(w => String(w.clientId) === String(claim.clientId));
        if (candidate) {
          updates.push({ _id: claim._id, warrantyId: candidate._id });
        }
      }
      if (updates.length) {
        const bulk = updates.map(u => ({ updateOne: { filter: { _id: u._id }, update: { $set: { warrantyId: u.warrantyId } } } }));
        const res = await WarrantyClaim.bulkWrite(bulk);
        console.log(`✅ Linked ${res.modifiedCount || updates.length} claims to warranties`);
      } else {
        console.log('ℹ️ No matching claims found to link by clientId');
      }
    } else {
      console.log('ℹ️ No existing warranty claims found');
    }

    // Summary by status
    const byStatus = warranties.reduce((acc, w) => { acc[w.status] = (acc[w.status] || 0) + 1; return acc; }, {});
    console.log('\n📊 Warranty Summary by Status:');
    Object.entries(byStatus).forEach(([s, c]) => console.log(`   • ${s}: ${c}`));

    await mongoose.disconnect();
    console.log('🔚 Database connection closed');
    console.log('✅ Warranty models seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error seeding warranty models:', err);
    process.exit(1);
  }
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedWarrantyModels();
}

export default seedWarrantyModels;
