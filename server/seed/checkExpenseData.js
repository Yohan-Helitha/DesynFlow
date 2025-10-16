import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const checkData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const expenseCount = await mongoose.connection.db.collection('expenses').countDocuments();
    const projectCount = await mongoose.connection.db.collection('projects').countDocuments();
    const estimationCount = await mongoose.connection.db.collection('projectestimations').countDocuments();
    
    console.log('📊 Database Statistics:');
    console.log(`   Expenses: ${expenseCount}`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Project Estimations: ${estimationCount}`);
    
    // Get sample expense
    const sampleExpense = await mongoose.connection.db.collection('expenses').findOne({});
    if (sampleExpense) {
      console.log('\n💸 Sample Expense:');
      console.log(`   Amount: LKR ${sampleExpense.amount.toLocaleString()}`);
      console.log(`   Category: ${sampleExpense.category}`);
      console.log(`   Description: ${sampleExpense.description.substring(0, 50)}...`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();
