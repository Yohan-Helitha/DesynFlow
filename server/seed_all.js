import 'dotenv/config';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import { Project } from './modules/finance/model/project.js';
import Material from './modules/finance/model/material.js';
import Expense from './modules/finance/model/expenses.js';
import FinanceSummary from './modules/finance/model/finance_summary.js';
import Notification from './modules/finance/model/notification.js';
import Quotation from './modules/finance/model/quotation_estimation.js';

const UserSchema = new mongoose.Schema({});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:cSVUhwvrkyoPdGOr@cluster0.fdaxphm.mongodb.net/desynflow';

const ids = {
  project: [
    '613b6a1f1c4ae0a1b8e4d101',
    '613b6a1f1c4ae0a1b8e4d102',
    '613b6a1f1c4ae0a1b8e4d103',
    '613b6a1f1c4ae0a1b8e4d104',
    '613b6a1f1c4ae0a1b8e4d105',
  ],
  user: [
    '613b6a1f1c4ae0a1b8e4d301',
    '613b6a1f1c4ae0a1b8e4d302',
    '613b6a1f1c4ae0a1b8e4d303',
    '613b6a1f1c4ae0a1b8e4d304',
    '613b6a1f1c4ae0a1b8e4d305',
  ],
  material: [
    '613b6a1f1c4ae0a1b8e4d201',
    '613b6a1f1c4ae0a1b8e4d202',
    '613b6a1f1c4ae0a1b8e4d203',
    '613b6a1f1c4ae0a1b8e4d204',
    '613b6a1f1c4ae0a1b8e4d205',
  ],
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Basic startup log
console.log('[seed] Script loaded');

async function seedAll() {
  console.log('[seed] seedAll started');
  // Helpful diagnostics
  try {
    const uriHost = (() => {
      try { return new URL(MONGO_URI).host; } catch { return '(unparsable URI)'; }
    })();
    const safeUri = (u) => u.replace(/:\/\/(.*)@/, '://<redacted>@');
    console.log(`[seed] MONGO_URI host: ${uriHost}`);
    console.log(`[seed] MONGO_URI: ${safeUri(MONGO_URI)}`);
  } catch {}

  mongoose.set('strictQuery', true);
  // Uncomment to debug queries
  // mongoose.set('debug', true);

  console.log('[seed] Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    maxPoolSize: 5,
  });
  console.log('[seed] Connected to MongoDB');
  // Insert Projects
  console.log('[seed] Upserting Projects...');
  for (let i = 0; i < ids.project.length; i++) {
    const res = await Project.updateOne(
      { _id: ids.project[i] },
      { $setOnInsert: { _id: ids.project[i], projectName: `Project ${i+1}`, status: ["Active","In Progress","Completed","On Hold","Cancelled"][i], progress: i*25 } },
      { upsert: true }
    );
    if (res.upsertedCount > 0) {
      console.log(`[seed] Project ${ids.project[i]} created.`);
    } else {
      console.log(`[seed] Project ${ids.project[i]} already exists.`);
    }
  }
  // Insert Users
  console.log('[seed] Upserting Users...');
  for (const id of ids.user) {
    const res = await User.updateOne(
      { _id: id },
      { $setOnInsert: { _id: id } },
      { upsert: true }
    );
    if (res.upsertedCount > 0) {
      console.log(`[seed] User ${id} created.`);
    } else {
      console.log(`[seed] User ${id} already exists.`);
    }
  }
  // Insert Materials
  const matNames = ["Cement","Steel","Bricks","Paint","Glass"];
  console.log('[seed] Upserting Materials...');
  for (let i = 0; i < ids.material.length; i++) {
    const res = await Material.updateOne(
      { _id: ids.material[i] },
      { $setOnInsert: { _id: ids.material[i], materialId: `M00${i+1}`, materialName: matNames[i], category: i<3?'Building':'Finishing', type: i<3?['Powder','Bar','Block'][i]:'Liquid', unit: i<3?['kg','m','pcs'][i]:'L', warrantyPeriod: null } },
      { upsert: true }
    );
    if (res.upsertedCount > 0) {
      console.log(`[seed] Material ${ids.material[i]} created.`);
    } else {
      console.log(`[seed] Material ${ids.material[i]} already exists.`);
    }
  }
  // Insert Expenses
  const expCats = ['Labor','Procurement','Transport','Misc','Labor'];
  const expDescs = ['Site prep','Steel purchase','Material delivery','Snacks','Finishing'];
  console.log('[seed] Creating Expenses...');
  for (let i = 0; i < 5; i++) {
    const doc = await Expense.create({
      projectId: ids.project[i],
      category: expCats[i],
      amount: (i+1)*200,
      description: expDescs[i],
      createdBy: ids.user[i]
    });
    console.log(`[seed] Expense ${doc._id} created.`);
  }
  // Insert Finance Summaries
  const finData = [
    { totalIncome: 10000, totalBalance: 8000 },
    { totalIncome: 20000, totalBalance: 15000 },
    { totalIncome: 5000, totalBalance: 2000 },
    { totalIncome: 30000, totalBalance: 25000 },
    { totalIncome: 12000, totalBalance: 9000 }
  ];
  console.log('[seed] Creating Finance Summaries...');
  for (const f of finData) {
    const doc = await FinanceSummary.create(f);
    console.log(`[seed] FinanceSummary ${doc._id} created.`);
  }
  // Insert Notifications
  const notifMsgs = ["Project Alpha started","Steel delivered","Payment received","Inspection scheduled","Project completed"];
  console.log('[seed] Creating Notifications...');
  for (let i = 0; i < 5; i++) {
    const doc = await Notification.create({
      userId: ids.user[i],
      message: notifMsgs[i],
      type: ["info","update","finance","alert","success"][i]
    });
    console.log(`[seed] Notification ${doc._id} created.`);
  }
  // Insert Quotations (if none exist yet for each project)
  console.log('[seed] Creating Quotations...');
  for (let i = 0; i < ids.project.length; i++) {
    const existing = await Quotation.findOne({ projectId: ids.project[i] });
    if (existing) {
      console.log(`[seed] Quotation for project ${ids.project[i]} already exists (version ${existing.version}).`);
      continue;
    }
    const laborItems = [
      { task: 'Design Work', hours: 10 + i, rate: 50, total: (10 + i) * 50 },
      { task: 'Site Preparation', hours: 5 + i, rate: 40, total: (5 + i) * 40 }
    ];
    const materialItems = [
      { materialId: ids.material[0], description: 'Cement batch', quantity: 10 + i, unitPrice: 12, total: (10 + i) * 12 },
      { materialId: ids.material[1], description: 'Steel rods', quantity: 15 + i, unitPrice: 30, total: (15 + i) * 30 }
    ];
    const serviceItems = [
      { service: '3D Rendering', cost: 300 + i * 20 },
      { service: 'Equipment Rental', cost: 150 + i * 15 }
    ];
    const contingencyItems = [
      { description: 'Buffer', amount: 100 + i * 10 }
    ];
    const taxes = [
      { description: 'VAT 15%', percentage: 15, amount: 0 } // will compute below
    ];
    const subtotal = laborItems.reduce((s,l)=>s+l.total,0) + materialItems.reduce((s,m)=>s+m.total,0) + serviceItems.reduce((s,sr)=>s+sr.cost,0);
    const totalContingency = contingencyItems.reduce((s,c)=>s+c.amount,0);
    let totalTax = 0;
    taxes[0].amount = Math.round(subtotal * (taxes[0].percentage/100));
    totalTax = taxes[0].amount;
    const grandTotal = subtotal + totalContingency + totalTax;
    const quotation = await Quotation.create({
      projectId: ids.project[i],
      estimateVersion: 1,
      version: 1,
      status: i === 0 ? 'Confirmed' : (i === 1 ? 'Draft' : 'Sent'),
      locked: i === 0,
      remarks: `Auto-seeded quotation for project ${i+1}`,
      createdBy: ids.user[0],
      laborItems,
      materialItems,
      serviceItems,
      contingencyItems,
      taxes,
      subtotal,
      totalContingency,
      totalTax,
      grandTotal,
      fileUrl: null
    });
    console.log(`[seed] Quotation ${quotation._id} created for project ${ids.project[i]} (grandTotal=${grandTotal}).`);
  }
  await mongoose.disconnect();
  console.log('[seed] All dummy data seeded.');
}

// Robust main-module detection for ESM on Windows and POSIX
const isMain = (() => {
  try {
    const thisFile = fileURLToPath(import.meta.url);
    const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
    return thisFile === invoked;
  } catch {
    return false;
  }
})();

if (isMain) {
  console.log('[seed] --- Seeding script started ---');
  seedAll()
    .then(() => {
      console.log('[seed] --- Seeding script finished successfully ---');
      process.exit(0);
    })
    .catch(e => {
      console.error('[seed] --- Seeding script failed ---');
      console.error(e);
      process.exit(1);
    });
}
