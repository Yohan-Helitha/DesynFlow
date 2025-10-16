import mongoose from 'mongoose';
import User from '../modules/auth/model/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Single finance user to create
const financeUser = {
  username: 'finance_admin',
  email: 'finance@desynflow.com',
  password: 'finance123',
  phone: '+94711111111',
  role: 'finance manager',
  isVerified: true,
  isActive: true
};

async function resetAndCreateFinance() {
  try {
    console.log('🚀 Starting reset and create finance user script...\n');
    
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    console.log('📍 Connecting to:', mongoURI.split('@')[1] || 'database');
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB successfully!\n');
    
    // Count existing users
    const existingCount = await User.countDocuments();
    console.log(`📊 Found ${existingCount} existing users in database`);
    
    // Delete all users
    console.log('🗑️  Deleting all users...');
    const deleteResult = await User.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} users\n`);
    
    // Create new finance user
    console.log('📝 Creating new finance user...');
    const user = new User(financeUser);
    const savedUser = await user.save();
    
    console.log('✅ Finance user created successfully!\n');
    console.log('=' .repeat(60));
    console.log('📋 Finance User Details:');
    console.log('=' .repeat(60));
    console.log(`Username:  ${savedUser.username}`);
    console.log(`Email:     ${savedUser.email}`);
    console.log(`Password:  finance123`);
    console.log(`Role:      ${savedUser.role}`);
    console.log(`Phone:     ${savedUser.phone}`);
    console.log(`Active:    ${savedUser.isActive}`);
    console.log(`Verified:  ${savedUser.isVerified}`);
    console.log('=' .repeat(60));
    
    // Verify creation
    const finalCount = await User.countDocuments();
    console.log(`\n✨ Total users in database: ${finalCount}`);
    
    await mongoose.disconnect();
    console.log('\n🔒 Disconnected from database');
    console.log('✅ Script completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the script
resetAndCreateFinance();
