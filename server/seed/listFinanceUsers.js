import mongoose from 'mongoose';
import User from '../modules/auth/model/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listFinanceUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully!\n');
    
    console.log('📋 All Finance Manager Users:');
    console.log('='.repeat(60));
    const financeUsers = await User.find({ role: 'finance manager' }).select('username email role');
    
    if (financeUsers.length === 0) {
      console.log('   No finance users found');
    } else {
      financeUsers.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: finance123`);
        console.log('   ' + '-'.repeat(56));
      });
      console.log(`\nTotal: ${financeUsers.length} finance users`);
    }
    
    await mongoose.disconnect();
    console.log('\n🔒 Disconnected from database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listFinanceUsers();
