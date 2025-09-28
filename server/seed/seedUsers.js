import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../modules/auth/model/user.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sample users for each role
const sampleUsers = [
  // Client
  {
    username: 'john_client',
    email: 'john.client@gmail.com',
    password: 'password123',
    phone: '+94701234567',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  
  // Customer Service Representative
  {
    username: 'sarah_csr',
    email: 'sarah.csr@desynflow.com',
    password: 'csr123456',
    phone: '+94702345678',
    role: 'customer service representative',
    isVerified: true,
    isActive: true
  },
  
  // Inspector
  {
    username: 'mike_inspector',
    email: 'mike.inspector@desynflow.com',
    password: 'inspect123',
    phone: '+94703456789',
    role: 'inspector',
    isVerified: true,
    isActive: true
  },
  
  // Manager
  {
    username: 'lisa_manager',
    email: 'lisa.manager@desynflow.com',
    password: 'manager123',
    phone: '+94704567890',
    role: 'manager',
    isVerified: true,
    isActive: true
  },
  
  // Project Manager
  {
    username: 'david_pm',
    email: 'david.pm@desynflow.com',
    password: 'project123',
    phone: '+94705678901',
    role: 'project manager',
    isVerified: true,
    isActive: true
  },
  
  // Finance Manager
  {
    username: 'emma_finance',
    email: 'emma.finance@desynflow.com',
    password: 'finance123',
    phone: '+94706789012',
    role: 'finance manager',
    isVerified: true,
    isActive: true
  },
  
  // Procurement Officer
  {
    username: 'alex_procurement',
    email: 'alex.procurement@desynflow.com',
    password: 'procure123',
    phone: '+94707890123',
    role: 'procurement officer',
    isVerified: true,
    isActive: true
  },
  
  // Warehouse Manager
  {
    username: 'carol_warehouse',
    email: 'carol.warehouse@desynflow.com',
    password: 'warehouse123',
    phone: '+94708901234',
    role: 'warehouse manager',
    isVerified: true,
    isActive: true
  },
  
  // Team Member
  {
    username: 'tom_member',
    email: 'tom.member@desynflow.com',
    password: 'member123',
    phone: '+94709012345',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  
  // Team Leader
  {
    username: 'anna_leader',
    email: 'anna.leader@desynflow.com',
    password: 'leader123',
    phone: '+94709123456',
    role: 'team leader',
    isVerified: true,
    isActive: true
  },
  
  // Additional client for testing
  {
    username: 'jane_client2',
    email: 'jane.client@gmail.com',
    password: 'password456',
    phone: '+94709234567',
    role: 'client',
    isVerified: false,
    isActive: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/desynflow';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Hash passwords before saving
const hashPasswords = async (users) => {
  for (let user of users) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  return users;
};

// Seed the database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing users (optional - uncomment if you want to reset)
    // await User.deleteMany({});
    // console.log('🗑️  Cleared existing users');
    
    // Check if users already exist
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('ℹ️  Users already exist. Skipping seed...');
      console.log('📊 Current user count:', existingUsers.length);
      return;
    }
    
    // Hash passwords
    const hashedUsers = await hashPasswords(sampleUsers);
    
    // Insert users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Successfully created ${createdUsers.length} users`);
    
    // Display created users
    console.log('\n📋 Created Users:');
    createdUsers.forEach(user => {
      console.log(`   • ${user.username} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
};

// Run the seed script
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
};

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}

export default runSeed;