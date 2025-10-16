import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../modules/project/model/project.model.js';
import Expense from '../modules/finance/model/expenses.js';
import ProjectEstimation from '../modules/finance/model/project_estimation.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const checkData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find In Progress projects
    const projects = await Project.find({ status: 'In Progress' });
    console.log(`Found ${projects.length} "In Progress" projects\n`);
    
    for (const project of projects) {
      console.log(`\n📊 Project: ${project.projectName}`);
      console.log(`   ID: ${project._id}`);
      
      // Get expenses for this project
      const expenses = await Expense.find({ projectId: project._id });
      console.log(`   Total Expenses: ${expenses.length}`);
      
      // Aggregate by category
      const expensesAgg = await Expense.aggregate([
        { $match: { projectId: project._id } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ]);
      
      console.log('\n   Expenses by Category:');
      expensesAgg.forEach(e => {
        console.log(`     ${e._id}: LKR ${e.total.toLocaleString()}`);
      });
      
      // Get estimation
      const estimation = await ProjectEstimation.findOne({ projectId: project._id })
        .sort({ version: -1 });
      
      if (estimation) {
        console.log('\n   Budget by Category:');
        console.log(`     Labor: LKR ${estimation.laborCost.toLocaleString()}`);
        console.log(`     Procurement (Material): LKR ${estimation.materialCost.toLocaleString()}`);
        console.log(`     Transport (Service): LKR ${estimation.serviceCost.toLocaleString()}`);
        console.log(`     Misc (Contingency): LKR ${estimation.contingencyCost.toLocaleString()}`);
      }
      
      console.log('\n' + '='.repeat(60));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();
