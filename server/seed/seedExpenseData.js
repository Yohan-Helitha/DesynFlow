import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Import models
import User from '../modules/auth/model/user.model.js';
import Project from '../modules/project/model/project.model.js';
import ProjectEstimation from '../modules/finance/model/project_estimation.js';
import Expense from '../modules/finance/model/expenses.js';

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/desynflow';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data function
const seedExpenseData = async () => {
  try {
    console.log('🗑️  Clearing existing expense data...');
    
    // Clear existing data
    await Expense.deleteMany({});
    console.log('   ✓ Cleared expenses');
    
    // Note: We'll check if projects exist, if not create them
    // Same for users and estimations
    
    console.log('\n📊 Creating seed data...\n');

    // 1. Create Users (if not exist)
    console.log('👥 Creating users...');
    
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create clients
    const clients = [];
    for (let i = 1; i <= 5; i++) {
      const existingClient = await User.findOne({ email: `client${i}@desynflow.com` });
      if (existingClient) {
        clients.push(existingClient);
      } else {
        const client = await User.create({
          username: `Client ${i}`,
          email: `client${i}@desynflow.com`,
          password: hashedPassword,
          phone: `071234567${i}`,
          role: 'client',
          isVerified: true,
          isActive: true
        });
        clients.push(client);
      }
    }
    console.log(`   ✓ Created/Found ${clients.length} clients`);

    // Create project managers
    const projectManagers = [];
    for (let i = 1; i <= 3; i++) {
      const existingPM = await User.findOne({ email: `pm${i}@desynflow.com` });
      if (existingPM) {
        projectManagers.push(existingPM);
      } else {
        const pm = await User.create({
          username: `Project Manager ${i}`,
          email: `pm${i}@desynflow.com`,
          password: hashedPassword,
          phone: `077234567${i}`,
          role: 'project manager',
          isVerified: true,
          isActive: true
        });
        projectManagers.push(pm);
      }
    }
    console.log(`   ✓ Created/Found ${projectManagers.length} project managers`);

    // Create finance managers
    const financeManagers = [];
    for (let i = 1; i <= 2; i++) {
      const existingFM = await User.findOne({ email: `finance${i}@desynflow.com` });
      if (existingFM) {
        financeManagers.push(existingFM);
      } else {
        const fm = await User.create({
          username: `Finance Manager ${i}`,
          email: `finance${i}@desynflow.com`,
          password: hashedPassword,
          phone: `075234567${i}`,
          role: 'finance manager',
          isVerified: true,
          isActive: true
        });
        financeManagers.push(fm);
      }
    }
    console.log(`   ✓ Created/Found ${financeManagers.length} finance managers`);

    // 2. Create Projects
    console.log('\n🏗️  Creating projects...');
    
    const projectsData = [
      {
        projectName: 'Modern Villa Construction',
        status: 'In Progress',
        progress: 65,
        startDate: new Date('2024-10-01'),
        dueDate: new Date('2025-03-15')
      },
      {
        projectName: 'Commercial Office Building',
        status: 'In Progress',
        progress: 45,
        startDate: new Date('2024-11-01'),
        dueDate: new Date('2025-05-30')
      },
      {
        projectName: 'Residential Apartment Complex',
        status: 'In Progress',
        progress: 30,
        startDate: new Date('2024-12-01'),
        dueDate: new Date('2025-08-30')
      },
      {
        projectName: 'Shopping Mall Renovation',
        status: 'In Progress',
        progress: 80,
        startDate: new Date('2024-08-15'),
        dueDate: new Date('2025-02-28')
      },
      {
        projectName: 'Beach Resort Development',
        status: 'In Progress',
        progress: 20,
        startDate: new Date('2025-01-10'),
        dueDate: new Date('2025-12-31')
      }
    ];

    // Clear and create fresh projects
    await Project.deleteMany({ projectName: { $in: projectsData.map(p => p.projectName) } });
    
    const projects = [];
    for (let i = 0; i < projectsData.length; i++) {
      const projectData = projectsData[i];
      const project = await Project.create({
        projectName: projectData.projectName,
        projectManagerId: projectManagers[i % projectManagers.length]._id,
        clientId: clients[i % clients.length]._id,
        status: projectData.status,
        progress: projectData.progress,
        startDate: projectData.startDate,
        dueDate: projectData.dueDate,
        estimateCreated: true
      });
      projects.push(project);
    }
    console.log(`   ✓ Created ${projects.length} projects`);

    // 3. Create Project Estimations (budgets)
    console.log('\n💰 Creating project estimations (budgets)...');
    
    await ProjectEstimation.deleteMany({ projectId: { $in: projects.map(p => p._id) } });
    
    const estimationsData = [
      { laborCost: 5000000, materialCost: 8000000, serviceCost: 2000000, contingencyCost: 1500000 }, // Villa
      { laborCost: 8000000, materialCost: 12000000, serviceCost: 3000000, contingencyCost: 2000000 }, // Office
      { laborCost: 10000000, materialCost: 15000000, serviceCost: 3500000, contingencyCost: 2500000 }, // Apartment
      { laborCost: 3000000, materialCost: 5000000, serviceCost: 1500000, contingencyCost: 1000000 }, // Mall
      { laborCost: 12000000, materialCost: 18000000, serviceCost: 4000000, contingencyCost: 3000000 }  // Resort
    ];

    const estimations = [];
    for (let i = 0; i < projects.length; i++) {
      const estData = estimationsData[i];
      const estimation = await ProjectEstimation.create({
        projectId: projects[i]._id,
        version: 1,
        laborCost: estData.laborCost,
        materialCost: estData.materialCost,
        serviceCost: estData.serviceCost,
        contingencyCost: estData.contingencyCost,
        total: estData.laborCost + estData.materialCost + estData.serviceCost + estData.contingencyCost,
        createdBy: financeManagers[0]._id,
        status: 'Approved'
      });
      estimations.push(estimation);
    }
    console.log(`   ✓ Created ${estimations.length} project estimations`);

    // 4. Create Expenses (at least 15 expenses)
    console.log('\n💸 Creating expenses...\n');

    const expensesData = [
      // Project 1 - Modern Villa (High spending on Labor and Materials - approaching budget limits)
      {
        projectId: projects[0]._id,
        category: 'Labor',
        amount: 4200000, // 84% of 5M budget
        description: 'Construction labor payments for Q1 - foundation, framing, and roofing work',
        createdBy: projectManagers[0]._id,
        proof: 'uploads/expense-labor-villa-q1.pdf'
      },
      {
        projectId: projects[0]._id,
        category: 'Procurement',
        amount: 6800000, // 85% of 8M budget
        description: 'Cement, steel reinforcement, bricks, and roofing materials procurement',
        createdBy: projectManagers[0]._id,
        proof: 'uploads/expense-materials-villa.pdf'
      },
      {
        projectId: projects[0]._id,
        category: 'Transport',
        amount: 1600000, // 80% of 2M budget
        description: 'Material transportation and machinery rental costs',
        createdBy: projectManagers[0]._id,
        proof: 'uploads/expense-transport-villa.pdf'
      },
      {
        projectId: projects[0]._id,
        category: 'Misc',
        amount: 800000, // 53% of 1.5M budget
        description: 'Site office setup, utilities, and safety equipment',
        createdBy: projectManagers[0]._id,
        proof: 'uploads/expense-misc-villa.pdf'
      },

      // Project 2 - Commercial Office (Moderate spending)
      {
        projectId: projects[1]._id,
        category: 'Labor',
        amount: 3200000, // 40% of 8M budget
        description: 'Foundation work and structural steel installation labor',
        createdBy: projectManagers[1]._id,
        proof: 'uploads/expense-labor-office.pdf'
      },
      {
        projectId: projects[1]._id,
        category: 'Procurement',
        amount: 5400000, // 45% of 12M budget
        description: 'Structural steel, concrete, glass panels, and HVAC equipment',
        createdBy: projectManagers[1]._id,
        proof: 'uploads/expense-materials-office.pdf'
      },
      {
        projectId: projects[1]._id,
        category: 'Transport',
        amount: 1200000, // 40% of 3M budget
        description: 'Heavy equipment transportation and crane rental',
        createdBy: projectManagers[1]._id,
        proof: 'uploads/expense-transport-office.pdf'
      },

      // Project 3 - Apartment Complex (Early stage - low spending)
      {
        projectId: projects[2]._id,
        category: 'Labor',
        amount: 2500000, // 25% of 10M budget
        description: 'Site clearing, excavation, and foundation labor',
        createdBy: projectManagers[2]._id,
        proof: 'uploads/expense-labor-apartment.pdf'
      },
      {
        projectId: projects[2]._id,
        category: 'Procurement',
        amount: 3800000, // 25% of 15M budget
        description: 'Foundation materials - concrete, reinforcement bars, formwork',
        createdBy: projectManagers[2]._id,
        proof: 'uploads/expense-materials-apartment.pdf'
      },
      {
        projectId: projects[2]._id,
        category: 'Misc',
        amount: 650000, // 26% of 2.5M budget
        description: 'Site permits, surveys, and temporary facilities',
        createdBy: projectManagers[2]._id,
        proof: 'uploads/expense-misc-apartment.pdf'
      },

      // Project 4 - Shopping Mall (High progress - over budget on some categories!)
      {
        projectId: projects[3]._id,
        category: 'Labor',
        amount: 3200000, // 106% of 3M budget - OVER BUDGET!
        description: 'Interior finishing work - flooring, painting, electrical, plumbing',
        createdBy: projectManagers[0]._id,
        proof: 'uploads/expense-labor-mall.pdf'
      },
      {
        projectId: projects[3]._id,
        category: 'Procurement',
        amount: 5100000, // 102% of 5M budget - OVER BUDGET!
        description: 'Floor tiles, paint, lighting fixtures, HVAC systems, and escalators',
        createdBy: projectManagers[0]._id,
        proof: 'uploads/expense-materials-mall.pdf'
      },
      {
        projectId: projects[3]._id,
        category: 'Transport',
        amount: 1350000, // 90% of 1.5M budget
        description: 'Material delivery and specialized equipment transport',
        createdBy: projectManagers[0]._id,
        proof: 'uploads/expense-transport-mall.pdf'
      },

      // Project 5 - Beach Resort (Just started)
      {
        projectId: projects[4]._id,
        category: 'Labor',
        amount: 1800000, // 15% of 12M budget
        description: 'Initial site preparation and foundation work',
        createdBy: projectManagers[1]._id,
        proof: 'uploads/expense-labor-resort.pdf'
      },
      {
        projectId: projects[4]._id,
        category: 'Procurement',
        amount: 2700000, // 15% of 18M budget
        description: 'Foundation materials and initial construction supplies',
        createdBy: projectManagers[1]._id,
        proof: 'uploads/expense-materials-resort.pdf'
      },
      {
        projectId: projects[4]._id,
        category: 'Misc',
        amount: 450000, // 15% of 3M budget
        description: 'Environmental impact study, permits, and site office setup',
        createdBy: projectManagers[1]._id,
        proof: 'uploads/expense-misc-resort.pdf'
      }
    ];

    const expenses = [];
    for (const expenseData of expensesData) {
      const expense = await Expense.create(expenseData);
      expenses.push(expense);
      
      // Get project and estimation for display
      const project = projects.find(p => p._id.equals(expenseData.projectId));
      const estimation = estimations.find(e => e.projectId.equals(expenseData.projectId));
      
      const categoryBudgets = {
        'Labor': estimation.laborCost,
        'Procurement': estimation.materialCost,
        'Transport': estimation.serviceCost,
        'Misc': estimation.contingencyCost
      };
      
      const budget = categoryBudgets[expenseData.category];
      const percentage = ((expenseData.amount / budget) * 100).toFixed(1);
      const status = percentage >= 100 ? '🔴 OVER BUDGET' : percentage >= 80 ? '🟡 HIGH' : '🟢 OK';
      
      console.log(`   ✓ ${project.projectName}`);
      console.log(`     Category: ${expenseData.category} | Amount: LKR ${expenseData.amount.toLocaleString()}`);
      console.log(`     Budget Usage: ${percentage}% (${status})`);
      console.log(`     Description: ${expenseData.description.substring(0, 60)}...`);
      console.log();
    }

    console.log(`\n✅ Created ${expenses.length} expenses\n`);

    // 5. Calculate and display summary by project
    console.log('📊 EXPENSE SUMMARY BY PROJECT\n');
    console.log('=' .repeat(80));
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const estimation = estimations[i];
      
      // Get all expenses for this project
      const projectExpenses = await Expense.find({ projectId: project._id });
      
      // Calculate totals by category
      const categoryTotals = {
        Labor: 0,
        Procurement: 0,
        Transport: 0,
        Misc: 0
      };
      
      projectExpenses.forEach(exp => {
        categoryTotals[exp.category] += exp.amount;
      });
      
      const totalSpent = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
      const totalBudget = estimation.total;
      const overallPercentage = ((totalSpent / totalBudget) * 100).toFixed(1);
      
      console.log(`\n${project.projectName} (${project.progress}% complete)`);
      console.log('-'.repeat(80));
      console.log(`  Total Budget: LKR ${totalBudget.toLocaleString()}`);
      console.log(`  Total Spent:  LKR ${totalSpent.toLocaleString()} (${overallPercentage}%)`);
      console.log(`  Remaining:    LKR ${(totalBudget - totalSpent).toLocaleString()}\n`);
      
      // Category breakdown
      const categories = [
        { name: 'Labor', budget: estimation.laborCost, spent: categoryTotals.Labor },
        { name: 'Procurement', budget: estimation.materialCost, spent: categoryTotals.Procurement },
        { name: 'Transport', budget: estimation.serviceCost, spent: categoryTotals.Transport },
        { name: 'Misc', budget: estimation.contingencyCost, spent: categoryTotals.Misc }
      ];
      
      categories.forEach(cat => {
        const pct = cat.budget > 0 ? ((cat.spent / cat.budget) * 100).toFixed(1) : 0;
        const status = pct >= 100 ? '🔴' : pct >= 80 ? '🟡' : '🟢';
        const remaining = cat.budget - cat.spent;
        console.log(`  ${status} ${cat.name.padEnd(12)} | Budget: ${cat.budget.toLocaleString().padStart(12)} | Spent: ${cat.spent.toLocaleString().padStart(12)} | ${pct}% | Remaining: ${remaining.toLocaleString()}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Overall summary
    console.log('\n📈 OVERALL SUMMARY\n');
    console.log(`   Total Users Created:       ${clients.length + projectManagers.length + financeManagers.length}`);
    console.log(`   Total Projects:            ${projects.length}`);
    console.log(`   Total Estimations:         ${estimations.length}`);
    console.log(`   Total Expenses:            ${expenses.length}`);
    
    const totalBudgetAll = estimations.reduce((sum, est) => sum + est.total, 0);
    const totalSpentAll = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const overallPct = ((totalSpentAll / totalBudgetAll) * 100).toFixed(1);
    
    console.log(`\n   Total Budget (All Projects): LKR ${totalBudgetAll.toLocaleString()}`);
    console.log(`   Total Spent (All Projects):  LKR ${totalSpentAll.toLocaleString()} (${overallPct}%)`);
    console.log(`   Total Remaining:             LKR ${(totalBudgetAll - totalSpentAll).toLocaleString()}`);
    
    console.log('\n✨ Expense seed data created successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// Main execution
const run = async () => {
  try {
    await connectDB();
    await seedExpenseData();
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
};

run();
