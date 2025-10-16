import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Expense from '../modules/finance/model/expenses.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const cleanBadExpenses = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find expenses with amounts over 100 million (likely bad data)
    const badExpenses = await Expense.find({ amount: { $gt: 100000000 } });
    
    console.log(`Found ${badExpenses.length} expenses with suspiciously high amounts:\n`);
    
    badExpenses.forEach(exp => {
      console.log(`  - ID: ${exp._id}`);
      console.log(`    Category: ${exp.category}`);
      console.log(`    Amount: LKR ${exp.amount.toLocaleString()}`);
      console.log(`    Description: ${exp.description}`);
      console.log(`    Created: ${exp.createdAt}\n`);
    });
    
    if (badExpenses.length > 0) {
      console.log('🗑️  Deleting bad expense entries...\n');
      const result = await Expense.deleteMany({ amount: { $gt: 100000000 } });
      console.log(`✅ Deleted ${result.deletedCount} bad expense entries\n`);
    } else {
      console.log('✅ No bad expenses found. Database is clean!\n');
    }
    
    // Also check for expenses with projectId = null
    const nullProjectExpenses = await Expense.find({ projectId: null });
    console.log(`Found ${nullProjectExpenses.length} expenses with null projectId:\n`);
    
    if (nullProjectExpenses.length > 0) {
      nullProjectExpenses.forEach(exp => {
        console.log(`  - ID: ${exp._id}, Category: ${exp.category}, Amount: ${exp.amount}, Desc: ${exp.description}`);
      });
      
      console.log('\n🗑️  Deleting expenses with null projectId...\n');
      const result2 = await Expense.deleteMany({ projectId: null });
      console.log(`✅ Deleted ${result2.deletedCount} expenses with null projectId\n`);
    }
    
    console.log('🎉 Database cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanBadExpenses();
