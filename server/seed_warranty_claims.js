// Seed script for Warranty and WarrantyClaim dummy data
// Usage: node seed_warranty_claims.js (from server directory after env connection config is set)

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Warranty from './modules/finance/model/warrenty.js';
import WarrantyClaim from './modules/finance/model/warrenty_claim.js';
import Material from './modules/finance/model/material.js';
import { Project } from './modules/finance/model/project.js';
import { User } from './modules/finance/model/user.js';

dotenv.config();

async function connect() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/desynflow';
  await mongoose.connect(uri, { autoIndex: true });
  console.log('Connected to MongoDB:', uri);
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

async function seed() {
  await connect();
  try {
    // Optional: clear existing test data (narrow to only what we create by tag?)
    // Comment out if you don't want to wipe.
    // await WarrantyClaim.deleteMany({});
    // await Warranty.deleteMany({});

    console.log('Seeding reference users...');
    const [client, reviewer, warehouseUser] = await User.create([
      { name: 'Client Alpha', email: 'client.alpha@example.com' },
      { name: 'Finance Reviewer', email: 'finance.reviewer@example.com' },
      { name: 'Warehouse Ops', email: 'warehouse.ops@example.com' }
    ]);

    console.log('Seeding project...');
    const project = await Project.create({ projectName: 'Solar Panel Installation', clientId: client._id });

    console.log('Seeding materials...');
    const [panel, inverter, battery] = await Material.create([
      { materialId: 'MAT-001', materialName: 'Solar Panel X200', category: 'Energy', type: 'Panel', unit: 'pcs', warrantyPeriod: '24' },
      { materialId: 'MAT-002', materialName: 'Inverter Pro 5kW', category: 'Energy', type: 'Inverter', unit: 'pcs', warrantyPeriod: '18' },
      { materialId: 'MAT-003', materialName: 'Battery Pack LiFe', category: 'Energy', type: 'Battery', unit: 'pcs', warrantyPeriod: '36' }
    ]);

    console.log('Seeding warranties...');
    const now = new Date();
    const warranties = await Warranty.create([
      { projectId: project._id, clientId: client._id, itemId: panel._id, warrantyStart: addMonths(now, -2), warrantyEnd: addMonths(now, 22), status: 'Active' },
      { projectId: project._id, clientId: client._id, itemId: inverter._id, warrantyStart: addMonths(now, -20), warrantyEnd: addMonths(now, -2), status: 'Expired' },
      { projectId: project._id, clientId: client._id, itemId: battery._id, warrantyStart: addMonths(now, -1), warrantyEnd: addMonths(now, 35), status: 'Active' },
      { projectId: project._id, clientId: client._id, itemId: panel._id, warrantyStart: addMonths(now, -10), warrantyEnd: addMonths(now, 14), status: 'Claimed' },
      { projectId: project._id, clientId: client._id, itemId: inverter._id, warrantyStart: addMonths(now, -8), warrantyEnd: addMonths(now, 10), status: 'Replaced' }
    ]);

    console.log('Seeding claims...');
    const claims = await WarrantyClaim.create([
      {
        warrantyId: warranties[3]._id, // Claimed warranty
        clientId: client._id,
        issueDescription: 'Performance degradation observed in panel string 2.',
        status: 'UnderReview'
      },
      {
        warrantyId: warranties[0]._id, // Active warranty
        clientId: client._id,
        issueDescription: 'Micro cracks identified on corner cell.',
        status: 'Approved',
        financeReviewerId: reviewer._id,
        warehouseAction: { shippedReplacement: false }
      },
      {
        warrantyId: warranties[1]._id, // Expired warranty
        clientId: client._id,
        issueDescription: 'Inverter shutting down intermittently.',
        status: 'Rejected',
        financeReviewerId: reviewer._id
      },
      {
        warrantyId: warranties[4]._id, // Replaced warranty
        clientId: client._id,
        issueDescription: 'Unit serial mismatch after replacement check.',
        status: 'Replaced',
        financeReviewerId: reviewer._id,
        warehouseAction: { shippedReplacement: true, shippedAt: addMonths(now, -1) }
      },
      {
        warrantyId: warranties[2]._id, // Active battery warranty
        clientId: client._id,
        issueDescription: 'Battery capacity dropped below 80% in 3 months.',
        status: 'Submitted'
      }
    ]);

    console.log('Created warranties:', warranties.map(w => w._id.toString()));
    console.log('Created claims:', claims.map(c => c._id.toString()));
    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seed();
