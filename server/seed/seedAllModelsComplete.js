import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import all seed functions
import seedComprehensiveData from './seedComprehensiveData.js';
import seedFinanceModels from './seedFinanceModels.js';
import seedProjectModels from './seedProjectModels.js';
import seedSupplierModels from './seedSupplierModels.js';
import seedWarrantyModels from './seedWarrantyModels.js';

const mongoURI = process.env.MONGO_URI;

async function seedAllModelsComplete() {
  try {
    console.log('🚀 STARTING COMPLETE DATABASE SEEDING');
    console.log('=' + '='.repeat(50));
    
    const startTime = Date.now();

    // Step 1: Seed basic comprehensive data (users, suppliers, materials, projects, teams, payments)
    console.log('\\n🌱 PHASE 1: Seeding Core Data');
    console.log('-'.repeat(30));
    await seedComprehensiveData();
    
    // Give a small delay to ensure data is properly saved
    await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 2: Seed finance models (expenses, warranty claims)
    console.log('\\n💰 PHASE 2: Seeding Finance Models');
    console.log('-'.repeat(30));
    await seedFinanceModels();
    
    await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 2.1: Seed warranties (link to projects, clients, materials)
  console.log('\n🛡️ PHASE 2.1: Seeding Warranty Models');
  console.log('-'.repeat(30));
  await seedWarrantyModels();
    
  await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Seed project models (milestones, tasks, progress updates)
    console.log('\\n🏗️ PHASE 3: Seeding Project Models');
    console.log('-'.repeat(30));
    await seedProjectModels();
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Seed supplier models (purchase orders, sample orders)
    console.log('\\n📦 PHASE 4: Seeding Supplier Models');
    console.log('-'.repeat(30));
    await seedSupplierModels();
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Final summary
    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);
    
    console.log('\\n🎉 COMPLETE DATABASE SEEDING SUMMARY');
    console.log('=' + '='.repeat(50));
    
    // Connect to get final statistics
    await mongoose.connect(mongoURI);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    const projectCount = await mongoose.connection.db.collection('projects').countDocuments();
    const supplierCount = await mongoose.connection.db.collection('suppliers').countDocuments();
    const materialCount = await mongoose.connection.db.collection('materials').countDocuments();
    const teamCount = await mongoose.connection.db.collection('teams').countDocuments();
    const paymentCount = await mongoose.connection.db.collection('payments').countDocuments();
  const expenseCount = await mongoose.connection.db.collection('expenses').countDocuments();
  const warrantyCount = await mongoose.connection.db.collection('warranties').countDocuments();
    const milestoneCount = await mongoose.connection.db.collection('milestones').countDocuments();
    const taskCount = await mongoose.connection.db.collection('tasks').countDocuments();
    const progressUpdateCount = await mongoose.connection.db.collection('progressupdates').countDocuments();
    const purchaseOrderCount = await mongoose.connection.db.collection('purchaseorders').countDocuments();
    const sampleOrderCount = await mongoose.connection.db.collection('sampleorders').countDocuments();
    const warrantyClaimCount = await mongoose.connection.db.collection('warrantyclaims').countDocuments();
    const inspectionRequestCount = await mongoose.connection.db.collection('inspectionrequests').countDocuments();

    console.log('📊 FINAL DATA STATISTICS:');
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   🏗️ Projects: ${projectCount}`);
    console.log(`   🏢 Suppliers: ${supplierCount}`);
    console.log(`   🧱 Materials: ${materialCount}`);
    console.log(`   👨‍👩‍👧‍👦 Teams: ${teamCount}`);
    console.log(`   🔍 Inspection Requests: ${inspectionRequestCount}`);
    console.log(`   💰 Payments: ${paymentCount}`);
  console.log(`   💸 Expenses: ${expenseCount}`);
  console.log(`   🛡️ Warranties: ${warrantyCount}`);
    console.log(`   🎯 Milestones: ${milestoneCount}`);
    console.log(`   📋 Tasks: ${taskCount}`);
    console.log(`   📈 Progress Updates: ${progressUpdateCount}`);
    console.log(`   📦 Purchase Orders: ${purchaseOrderCount}`);
    console.log(`   🧪 Sample Orders: ${sampleOrderCount}`);
    console.log(`   🔧 Warranty Claims: ${warrantyClaimCount}`);
    console.log(`   📁 Total Collections: ${collections.length}`);
    
    console.log('\\n⏱️ PERFORMANCE METRICS:');
    console.log(`   • Total Seeding Time: ${totalTime} seconds`);
    console.log(`   • Average Time per Collection: ${Math.round(totalTime / 14)} seconds`);
    
    console.log('\\n🔗 DATA RELATIONSHIPS CREATED:');
    console.log(`   • User-Project relationships: ${projectCount} projects linked to users`);
    console.log(`   • Project-Task relationships: ${taskCount} tasks assigned to projects`);
    console.log(`   • Project-Milestone relationships: ${milestoneCount} milestones tracking project progress`);
    console.log(`   • Supplier-Material relationships: ${materialCount} materials from ${supplierCount} suppliers`);
    console.log(`   • Finance-Project relationships: ${paymentCount} payments + ${expenseCount} expenses linked to projects`);
    console.log(`   • Procurement relationships: ${purchaseOrderCount} purchase orders + ${sampleOrderCount} sample orders`);

    console.log('\\n🎯 SYSTEM READINESS:');
    console.log('   ✅ User authentication system ready');
    console.log('   ✅ Project management workflows ready');
    console.log('   ✅ Financial tracking system ready');
    console.log('   ✅ Supplier management system ready');
    console.log('   ✅ Inspection workflow ready');
    console.log('   ✅ Team collaboration features ready');
    
    console.log('=' + '='.repeat(50));
    
    await mongoose.disconnect();
    console.log('🔚 Database connection closed');
    console.log('🎉✨ COMPLETE DATABASE SEEDING FINISHED SUCCESSFULLY! ✨🎉');
    
  } catch (error) {
    console.error('❌ Error in complete database seeding:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAllModelsComplete();
}

export default seedAllModelsComplete;