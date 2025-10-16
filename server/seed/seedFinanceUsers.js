import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../modules/auth/model/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Finance users to seed
const financeUsers = [
  {
    username: 'finance1',
    email: 'finance1@desynflow.com',
    password: 'finance123',
    phone: '+94711111111',
    role: 'finance manager',
    isVerified: true,
    isActive: true
  },
  {
    username: 'finance2',
    email: 'finance2@desynflow.com',
    password: 'finance123',
    phone: '+94712222222',
    role: 'finance manager',
    isVerified: true,
    isActive: true
  },
  {
    username: 'finance3',
    email: 'finance3@desynflow.com',
    password: 'finance123',
    phone: '+94713333333',
    role: 'finance manager',
    isVerified: true,
    isActive: true
  },
  {
    username: 'emma_finance',
    email: 'emma.finance@desynflow.com',
    password: 'finance123',
    phone: '+94706789012',
    role: 'finance manager',
    isVerified: true,
    isActive: true
  },
  {
    username: 'nuwan_finance',
    email: 'nuwan.finance@desynflow.com',
    password: 'finance123',
    phone: '+94777777777',
    role: 'finance manager',
    isVerified: true,
    isActive: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/desynflow';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    console.log('📍 Database:', mongoURI.split('/').pop().split('?')[0]);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed finance users
const seedFinanceUsers = async () => {
  try {
    console.log('🌱 Starting finance users seeding...\n');
    
    // Check for existing finance users
    const existingEmails = await User.find({ 
      email: { $in: financeUsers.map(u => u.email) } 
    }).select('email');
    
    const existingEmailSet = new Set(existingEmails.map(u => u.email));
    const newUsers = financeUsers.filter(u => !existingEmailSet.has(u.email));
    
    if (newUsers.length === 0) {
      console.log('ℹ️  All finance users already exist. Skipping seed...');
      console.log('📊 Existing finance users:', existingEmails.length);
      existingEmails.forEach(u => console.log(`   • ${u.email}`));
      return;
    }
    
    console.log(`📝 Found ${existingEmailSet.size} existing users, creating ${newUsers.length} new users...\n`);
    
    // Create users one by one to ensure password hashing works correctly
    const createdUsers = [];
    for (const userData of newUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created: ${savedUser.email} (${savedUser.username})`);
    }
    
    console.log(`\n✅ Successfully created ${createdUsers.length} finance users`);
    console.log('\n📋 All Finance Users:');
    const allFinanceUsers = await User.find({ role: 'finance manager' }).select('username email');
    allFinanceUsers.forEach(user => {
      console.log(`   • ${user.username} - ${user.email} - Password: finance123`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding finance users:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
};

// Run the seed script
const runSeed = async () => {
  try {
    console.log('🚀 Starting finance users seed script...');
    await connectDB();
    await seedFinanceUsers();
    console.log('✨ Seed script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
};

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('📂 Script file:', import.meta.url);
  console.log('📂 Process argv[1]:', process.argv[1]);
  runSeed();
}

export default seedFinanceUsers;
