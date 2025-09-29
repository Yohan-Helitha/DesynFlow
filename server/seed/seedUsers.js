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
  
  // Team Members (15 total)
  {
    username: 'tom_member1',
    email: 'tom.member1@desynflow.com',
    password: 'member123',
    phone: '+94709012345',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'sarah_member2',
    email: 'sarah.member2@desynflow.com',
    password: 'member123',
    phone: '+94709012346',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'john_member3',
    email: 'john.member3@desynflow.com',
    password: 'member123',
    phone: '+94709012347',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'maria_member4',
    email: 'maria.member4@desynflow.com',
    password: 'member123',
    phone: '+94709012348',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'james_member5',
    email: 'james.member5@desynflow.com',
    password: 'member123',
    phone: '+94709012349',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'lisa_member6',
    email: 'lisa.member6@desynflow.com',
    password: 'member123',
    phone: '+94709012350',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'david_member7',
    email: 'david.member7@desynflow.com',
    password: 'member123',
    phone: '+94709012351',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'emma_member8',
    email: 'emma.member8@desynflow.com',
    password: 'member123',
    phone: '+94709012352',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'alex_member9',
    email: 'alex.member9@desynflow.com',
    password: 'member123',
    phone: '+94709012353',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'carol_member10',
    email: 'carol.member10@desynflow.com',
    password: 'member123',
    phone: '+94709012354',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'mike_member11',
    email: 'mike.member11@desynflow.com',
    password: 'member123',
    phone: '+94709012355',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'anna_member12',
    email: 'anna.member12@desynflow.com',
    password: 'member123',
    phone: '+94709012356',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'robert_member13',
    email: 'robert.member13@desynflow.com',
    password: 'member123',
    phone: '+94709012357',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'sophia_member14',
    email: 'sophia.member14@desynflow.com',
    password: 'member123',
    phone: '+94709012358',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'daniel_member15',
    email: 'daniel.member15@desynflow.com',
    password: 'member123',
    phone: '+94709012359',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  
  // Team Leader (existing)
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