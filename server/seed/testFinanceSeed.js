import mongoose from 'mongoose';
import User from '../modules/auth/model/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🚀 Script started');
console.log('📍 MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');

const financeUsers = [
  {
    username: 'finance2',
    email: 'finance2@desynflow.com',
    password: 'finance123',
    phone: '+94712222222',
    role: 'finance manager',
    isVerified: true,
    isActive: true
  }
];

async function seedUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully!');
    
    console.log('🔍 Checking for existing user...');
    const existing = await User.findOne({ email: 'finance2@desynflow.com' });
    
    if (existing) {
      console.log('ℹ️  User already exists:', existing.email);
    } else {
      console.log('📝 Creating new user...');
      const user = new User(financeUsers[0]);
      await user.save();
      console.log('✅ User created successfully!');
      console.log('   Email:', user.email);
      console.log('   Username:', user.username);
      console.log('   Password: finance123');
    }
    
    await mongoose.disconnect();
    console.log('🔒 Disconnected from database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedUsers();
