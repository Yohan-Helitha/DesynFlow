import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import User from '../modules/auth/model/user.model.js';
import Project from '../modules/project/model/project.model.js';
import Expense from '../modules/finance/model/expenses.js';
import WarrantyClaim from '../modules/finance/model/warrenty_claim.js';

const mongoURI = process.env.MONGO_URI;

async function seedFinanceModels() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get existing data for relationships
    console.log('📊 Fetching existing data for relationships...');
    const users = await User.find({});
    const projects = await Project.find({});
    const financeManagers = users.filter(u => u.role === 'finance manager');
    const clients = users.filter(u => u.role === 'client');
    const projectManagers = users.filter(u => u.role === 'project manager');

    if (projects.length === 0 || users.length === 0) {
      console.log('❌ No existing users or projects found. Please run seedComprehensiveData.js first');
      process.exit(1);
    }

    console.log(`Found ${users.length} users, ${projects.length} projects`);

    // Clear existing finance data
    console.log('🗑️ Clearing existing finance data...');
    await Promise.all([
      Expense.deleteMany({}),
      WarrantyClaim.deleteMany({})
    ]);
    console.log('✅ Cleared existing finance data');

    // 1. Create Expenses
    console.log('\\n💰 Creating project expenses...');
    const expenseData = [];
    
    projects.forEach((project, index) => {
      // Create 2-4 expenses per project
      const numExpenses = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numExpenses; i++) {
        const categories = ['Labor', 'Procurement', 'Transport', 'Misc'];
        const descriptions = {
          'Labor': [
            'Mason wages for foundation work',
            'Electrician fees for wiring installation', 
            'Carpenter charges for door fitting',
            'Plumber costs for pipe installation'
          ],
          'Procurement': [
            'Cement and steel purchase',
            'Tiles and fittings procurement',
            'Paint and hardware supplies',
            'Electrical equipment purchase'
          ],
          'Transport': [
            'Material delivery charges',
            'Equipment transportation costs',
            'Site visit travel expenses',
            'Waste disposal transport'
          ],
          'Misc': [
            'Site inspection fees',
            'Permit and documentation costs',
            'Utility connection charges',
            'Emergency repair costs'
          ]
        };

        const category = categories[Math.floor(Math.random() * categories.length)];
        const categoryDescriptions = descriptions[category];
        
        expenseData.push({
          projectId: project._id,
          category: category,
          amount: Math.floor(Math.random() * 200000) + 10000, // LKR 10,000 - 210,000
          description: categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)],
          createdBy: projectManagers[index % projectManagers.length]._id,
          proof: Math.random() > 0.3 ? `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.pdf` : null
        });
      }
    });

    const expenses = await Expense.insertMany(expenseData);
    console.log(`✅ Created ${expenses.length} project expenses`);

    // 2. Create Warranty Claims
    console.log('\\n🔧 Creating warranty claims...');
    const warrantyClaimData = [];
    
    // Create 8-12 warranty claims
    for (let i = 0; i < 10; i++) {
      const client = clients[i % clients.length];
      const financeReviewer = financeManagers[i % financeManagers.length];
      
      const issueDescriptions = [
        'Tile cracking observed on bathroom floor after 6 months',
        'Door handle mechanism failed within warranty period',
        'Window frame showing rust stains despite aluminum coating',
        'Paint peeling off from external walls within 1 year',
        'Plumbing fixtures leaking at joint connections',
        'Electrical switch panel showing burn marks',
        'Roof tiles displaced during recent rain',
        'Concrete slab showing hairline cracks',
        'Glass panel has developed internal fogging',
        'Wooden floor boards showing warping issues'
      ];

      const statuses = ['Submitted', 'UnderReview', 'Approved', 'Rejected', 'Replaced'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      warrantyClaimData.push({
        warrantyId: new mongoose.Types.ObjectId(), // Placeholder - in real system would link to warranty
        clientId: client._id,
        issueDescription: issueDescriptions[i],
        status: status,
        financeReviewerId: financeReviewer._id,
        warehouseAction: {
          shippedReplacement: status === 'Replaced',
          shippedAt: status === 'Replaced' ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null
        }
      });
    }

    const warrantyClaims = await WarrantyClaim.insertMany(warrantyClaimData);
    console.log(`✅ Created ${warrantyClaims.length} warranty claims`);

    // Summary
    console.log('\\n📊 FINANCE MODELS SEEDING SUMMARY');
    console.log('=' + '='.repeat(45));
    console.log(`💰 Project Expenses: ${expenses.length}`);
    console.log(`🔧 Warranty Claims: ${warrantyClaims.length}`);
    console.log('\\n📈 Expense Breakdown by Category:');
    
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(expensesByCategory).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} expenses`);
    });

    console.log('\\n🔧 Warranty Claims by Status:');
    const claimsByStatus = warrantyClaims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(claimsByStatus).forEach(([status, count]) => {
      console.log(`   • ${status}: ${count} claims`);
    });

    console.log('=' + '='.repeat(45));

    await mongoose.disconnect();
    console.log('🔚 Database connection closed');
    console.log('✅ Finance models seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding finance models:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFinanceModels();
}

export default seedFinanceModels;