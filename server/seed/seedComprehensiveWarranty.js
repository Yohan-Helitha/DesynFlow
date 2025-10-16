/**
 * Comprehensive Warranty System Seed File
 * 
 * This script creates complete warranty data including:
 * 1. Warranties linked to projects, clients, and materials
 * 2. Warranty claims with various statuses
 * 3. Realistic dates and durations
 * 4. Both active and expired warranties
 * 
 * Prerequisites:
 * - Projects must exist (run seedProjectModels.js first)
 * - Clients (users with role='client') must exist (run seedUsers.js first)
 * - Materials must exist (run seedSupplierModels.js first)
 */

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

// Helper function to add months to a date
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// Helper function to add days to a date
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Parse warranty period string (e.g., "2 years", "12 months")
function parseWarrantyPeriod(periodStr) {
  if (!periodStr) return 12; // default 12 months
  const lower = String(periodStr).toLowerCase();
  
  const yearMatch = lower.match(/(\d+)\s*year/);
  if (yearMatch) return Number(yearMatch[1]) * 12;
  
  const monthMatch = lower.match(/(\d+)\s*month/);
  if (monthMatch) return Number(monthMatch[1]);
  
  // Fallback: try to parse as number
  const num = parseInt(lower, 10);
  return Number.isFinite(num) ? num : 12;
}

// Generate realistic issue descriptions for warranty claims
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
  'Plumbing fixtures leaking at joints',
  'Air conditioning unit making unusual noise',
  'Kitchen cabinet doors not closing properly',
  'Bathroom sink drain clogged frequently',
  'Wall paint fading unevenly in sunlit areas',
  'Grout between tiles cracking and falling out',
  'Metal fixtures showing rust after short period',
  'Electrical switches not functioning smoothly',
  'Water pipes making knocking sounds',
  'Concrete floor showing hairline cracks',
  'Sealant around windows deteriorating quickly'
];

async function seedComprehensiveWarranty() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connected to MongoDB\n');

    // Fetch prerequisite data
    console.log('📊 Fetching prerequisite data...');
    const [projects, clients, materials, financeUsers] = await Promise.all([
      Project.find({}).lean(),
      User.find({ role: 'client' }).lean(),
      Material.find({}).lean(),
      User.find({ role: 'finance' }).lean()
    ]);

    // Validation
    if (!projects.length) {
      console.log('❌ No projects found! Please run: node seed/seedProjectModels.js');
      await mongoose.disconnect();
      process.exit(1);
    }
    if (!clients.length) {
      console.log('❌ No clients found! Please run: node seed/seedUsers.js');
      await mongoose.disconnect();
      process.exit(1);
    }
    if (!materials.length) {
      console.log('❌ No materials found! Please run: node seed/seedSupplierModels.js');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ Found ${projects.length} projects`);
    console.log(`✅ Found ${clients.length} clients`);
    console.log(`✅ Found ${materials.length} materials`);
    console.log(`✅ Found ${financeUsers.length} finance users\n`);

    // Clear existing warranty data
    console.log('🗑️  Clearing existing warranty data...');
    await Warranty.deleteMany({});
    await WarrantyClaim.deleteMany({});
    console.log('✅ Cleared Warranty and WarrantyClaim collections\n');

    // Filter materials with warranty periods (typically finished products)
    const warrantableMaterials = materials.filter(m => m.warrantyPeriod);
    console.log(`📦 Found ${warrantableMaterials.length} warrantable materials\n`);

    // If no materials have warranty periods, assign some
    if (warrantableMaterials.length === 0) {
      console.log('⚠️  No materials with warranty periods found. Assigning warranty periods to materials...');
      const sampleMaterials = materials.slice(0, Math.min(20, materials.length));
      const warrantyPeriods = ['12 months', '24 months', '36 months', '5 years', '10 years'];
      
      for (let i = 0; i < sampleMaterials.length; i++) {
        const period = warrantyPeriods[i % warrantyPeriods.length];
        await Material.findByIdAndUpdate(sampleMaterials[i]._id, { warrantyPeriod: period });
        warrantableMaterials.push({ ...sampleMaterials[i], warrantyPeriod: period });
      }
      console.log(`✅ Assigned warranty periods to ${sampleMaterials.length} materials\n`);
    }

    // Generate warranties
    console.log('🛡️  Creating warranties...');
    const warrantyDocs = [];
    const now = new Date();
    
    let warrantyCount = 0;
    projects.forEach((project, projectIdx) => {
      // Each project gets 2-5 warranties
      const warrantyCountForProject = Math.floor(Math.random() * 4) + 2;
      
      // Get the client for this project
      const projectClient = clients.find(c => String(c._id) === String(project.clientId)) 
        || clients[projectIdx % clients.length];
      
      for (let i = 0; i < warrantyCountForProject; i++) {
        // Select a random warrantable material
        const material = warrantableMaterials[warrantyCount % warrantableMaterials.length];
        const durationMonths = parseWarrantyPeriod(material.warrantyPeriod);
        
        // Warranty start: between 24 months ago and 3 months ago
        const startOffsetMonths = Math.floor(Math.random() * 21) + 3;
        const startDate = addMonths(now, -startOffsetMonths);
        const endDate = addMonths(startDate, durationMonths);
        
        // Determine status
        let status = 'Active';
        if (endDate < now) {
          status = 'Expired';
        }
        // Small chance of being claimed or replaced
        const rand = Math.random();
        if (rand < 0.05 && status === 'Active') status = 'Claimed';
        if (rand < 0.02 && status === 'Active') status = 'Replaced';
        
        warrantyDocs.push({
          projectId: project._id,
          clientId: projectClient._id,
          itemId: material._id,
          warrantyStart: startDate,
          warrantyEnd: endDate,
          status
        });
        
        warrantyCount++;
      }
    });

    const warranties = await Warranty.insertMany(warrantyDocs);
    console.log(`✅ Created ${warranties.length} warranties\n`);

    // Generate warranty claims
    console.log('📝 Creating warranty claims...');
    const claimDocs = [];
    
    // Create claims for some warranties (especially active and recently expired ones)
    const claimableWarranties = warranties.filter(w => {
      const daysSinceEnd = Math.floor((now - w.warrantyEnd) / (1000 * 60 * 60 * 24));
      return w.status === 'Active' || (w.status === 'Expired' && daysSinceEnd < 90);
    });

    // Create claims for 20-40% of claimable warranties
    const numberOfClaims = Math.floor(claimableWarranties.length * (0.2 + Math.random() * 0.2));
    console.log(`   Creating ${numberOfClaims} claims for ${claimableWarranties.length} claimable warranties...`);

    for (let i = 0; i < numberOfClaims; i++) {
      const warranty = claimableWarranties[i % claimableWarranties.length];
      
      // Claim submitted between warranty start and now
      const daysSinceStart = Math.floor((now - warranty.warrantyStart) / (1000 * 60 * 60 * 24));
      const claimOffsetDays = Math.floor(Math.random() * daysSinceStart);
      const claimDate = addDays(warranty.warrantyStart, claimOffsetDays);
      
      // Status distribution
      const statusRand = Math.random();
      let claimStatus;
      let reviewerId = null;
      let warehouseAction = { shippedReplacement: false };
      
      if (statusRand < 0.15) {
        claimStatus = 'Submitted';
      } else if (statusRand < 0.30) {
        claimStatus = 'UnderReview';
        reviewerId = financeUsers[i % financeUsers.length]?._id || null;
      } else if (statusRand < 0.60) {
        claimStatus = 'Approved';
        reviewerId = financeUsers[i % financeUsers.length]?._id || null;
      } else if (statusRand < 0.80) {
        claimStatus = 'Rejected';
        reviewerId = financeUsers[i % financeUsers.length]?._id || null;
      } else {
        claimStatus = 'Replaced';
        reviewerId = financeUsers[i % financeUsers.length]?._id || null;
        warehouseAction = {
          shippedReplacement: true,
          shippedAt: addDays(claimDate, Math.floor(Math.random() * 14) + 3)
        };
      }
      
      claimDocs.push({
        warrantyId: warranty._id,
        clientId: warranty.clientId,
        issueDescription: issueDescriptions[i % issueDescriptions.length],
        proofUrl: Math.random() < 0.7 ? `/uploads/warranty-proof-${i + 1}.pdf` : null,
        status: claimStatus,
        financeReviewerId: reviewerId,
        warehouseAction,
        createdAt: claimDate,
        updatedAt: claimStatus === 'Submitted' ? claimDate : addDays(claimDate, Math.floor(Math.random() * 7) + 1)
      });
    }

    const claims = await WarrantyClaim.insertMany(claimDocs);
    console.log(`✅ Created ${claims.length} warranty claims\n`);

    // Generate summary statistics
    console.log('📊 Warranty Summary:');
    const statusCounts = warranties.reduce((acc, w) => {
      acc[w.status] = (acc[w.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = ((count / warranties.length) * 100).toFixed(1);
      console.log(`   • ${status}: ${count} (${percentage}%)`);
    });

    console.log('\n📊 Warranty Claim Summary:');
    const claimStatusCounts = claims.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(claimStatusCounts).forEach(([status, count]) => {
      const percentage = ((count / claims.length) * 100).toFixed(1);
      console.log(`   • ${status}: ${count} (${percentage}%)`);
    });

    // Show sample data
    console.log('\n📋 Sample Warranties:');
    const sampleWarranties = await Warranty.find({})
      .limit(3)
      .populate('projectId', 'projectName')
      .populate('clientId', 'username email')
      .populate('itemId', 'materialName category type warrantyPeriod');
    
    sampleWarranties.forEach((w, idx) => {
      const daysRemaining = Math.ceil((w.warrantyEnd - now) / (1000 * 60 * 60 * 24));
      console.log(`\n   ${idx + 1}. ${w._id}`);
      console.log(`      Project: ${w.projectId?.projectName || 'N/A'}`);
      console.log(`      Client: ${w.clientId?.username || 'N/A'} (${w.clientId?.email || 'N/A'})`);
      console.log(`      Item: ${w.itemId?.materialName || 'N/A'} (${w.itemId?.warrantyPeriod || 'N/A'})`);
      console.log(`      Status: ${w.status}`);
      console.log(`      Period: ${w.warrantyStart.toISOString().split('T')[0]} → ${w.warrantyEnd.toISOString().split('T')[0]}`);
      if (w.status === 'Active') {
        console.log(`      Days Remaining: ${daysRemaining} days`);
      }
    });

    if (claims.length > 0) {
      console.log('\n📋 Sample Warranty Claims:');
      const sampleClaims = await WarrantyClaim.find({})
        .limit(3)
        .populate({
          path: 'warrantyId',
          populate: {
            path: 'itemId',
            select: 'materialName'
          }
        })
        .populate('clientId', 'username email')
        .populate('financeReviewerId', 'username');
      
      sampleClaims.forEach((c, idx) => {
        console.log(`\n   ${idx + 1}. ${c._id}`);
        console.log(`      Warranty: ${c.warrantyId?._id || 'N/A'}`);
        console.log(`      Item: ${c.warrantyId?.itemId?.materialName || 'N/A'}`);
        console.log(`      Client: ${c.clientId?.username || 'N/A'}`);
        console.log(`      Status: ${c.status}`);
        console.log(`      Issue: ${c.issueDescription?.substring(0, 60)}...`);
        if (c.financeReviewerId) {
          console.log(`      Reviewer: ${c.financeReviewerId.username || 'N/A'}`);
        }
        if (c.warehouseAction?.shippedReplacement) {
          console.log(`      Shipped: ${c.warehouseAction.shippedAt?.toISOString().split('T')[0] || 'Yes'}`);
        }
      });
    }

    console.log('\n');
    await mongoose.disconnect();
    console.log('🔚 Database connection closed');
    console.log('✅ Comprehensive warranty seeding completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding warranty data:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedComprehensiveWarranty();
}

export default seedComprehensiveWarranty;
