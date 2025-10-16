import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import User from '../modules/auth/model/user.model.js';

const mongoURI = process.env.MONGO_URI;

// Realistic Sri Lankan client users
const clientUsers = [
  {
    username: 'pradeep_silva',
    email: 'pradeep.silva@gmail.com',
    password: 'password123',
    phone: '+94771234567',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'nayomi_fernando',
    email: 'nayomi.fernando@yahoo.com',
    password: 'password123',
    phone: '+94772345678',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'kamal_perera',
    email: 'kamal.perera@gmail.com',
    password: 'password123',
    phone: '+94773456789',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'sanduni_jayawardena',
    email: 'sanduni.j@outlook.com',
    password: 'password123',
    phone: '+94774567890',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'roshan_wickramasinghe',
    email: 'roshan.w@gmail.com',
    password: 'password123',
    phone: '+94775678901',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'chamari_rathnayake',
    email: 'chamari.rathnayake@gmail.com',
    password: 'password123',
    phone: '+94776789012',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'thilina_rajapaksa',
    email: 'thilina.rajapaksa@gmail.com',
    password: 'password123',
    phone: '+94777890123',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'harini_gunawardena',
    email: 'harini.g@yahoo.com',
    password: 'password123',
    phone: '+94778901234',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'ruwan_bandara',
    email: 'ruwan.bandara@hotmail.com',
    password: 'password123',
    phone: '+94779012345',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'malsha_dissanayake',
    email: 'malsha.dissanayake@gmail.com',
    password: 'password123',
    phone: '+94770123456',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'akila_senanayake',
    email: 'akila.senanayake@gmail.com',
    password: 'password123',
    phone: '+94771987654',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'tharushi_mendis',
    email: 'tharushi.mendis@yahoo.com',
    password: 'password123',
    phone: '+94772987654',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'ishara_kumarasinghe',
    email: 'ishara.k@gmail.com',
    password: 'password123',
    phone: '+94773987654',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'dimuthu_samaraweera',
    email: 'dimuthu.samaraweera@outlook.com',
    password: 'password123',
    phone: '+94774987654',
    role: 'client',
    isVerified: true,
    isActive: true
  },
  {
    username: 'kaveesha_dias',
    email: 'kaveesha.dias@gmail.com',
    password: 'password123',
    phone: '+94775987654',
    role: 'client',
    isVerified: true,
    isActive: true
  }
];

// Additional staff users with different roles
const staffUsers = [
  {
    username: 'saman_csr',
    email: 'saman.csr@desynflow.com',
    password: 'password123',
    phone: '+94771111111',
    role: 'customer service representative',
    isVerified: true,
    isActive: true
  },
  {
    username: 'niluka_inspector1',
    email: 'niluka.inspector@desynflow.com',
    password: 'password123',
    phone: '+94772222222',
    role: 'inspector',
    isVerified: true,
    isActive: true
  },
  {
    username: 'chaminda_inspector2',
    email: 'chaminda.inspector@desynflow.com',
    password: 'password123',
    phone: '+94773333333',
    role: 'inspector',
    isVerified: true,
    isActive: true
  },
  {
    username: 'sandun_manager',
    email: 'sandun.manager@desynflow.com',
    password: 'password123',
    phone: '+94774444444',
    role: 'manager',
    isVerified: true,
    isActive: true
  },
  {
    username: 'priyanka_pm1',
    email: 'priyanka.pm@desynflow.com',
    password: 'password123',
    phone: '+94775555555',
    role: 'project manager',
    isVerified: true,
    isActive: true
  },
  {
    username: 'lasantha_pm2',
    email: 'lasantha.pm@desynflow.com',
    password: 'password123',
    phone: '+94776666666',
    role: 'project manager',
    isVerified: true,
    isActive: true
  },
  {
    username: 'nuwan_finance',
    email: 'nuwan.finance@desynflow.com',
    password: 'password123',
    phone: '+94777777777',
    role: 'finance manager',
    isVerified: true,
    isActive: true
  },
  {
    username: 'manjula_procurement',
    email: 'manjula.procurement@desynflow.com',
    password: 'password123',
    phone: '+94778888888',
    role: 'procurement officer',
    isVerified: true,
    isActive: true
  },
  {
    username: 'gayan_warehouse',
    email: 'gayan.warehouse@desynflow.com',
    password: 'password123',
    phone: '+94779999999',
    role: 'warehouse manager',
    isVerified: true,
    isActive: true
  },
  {
    username: 'ranga_member1',
    email: 'ranga.member@desynflow.com',
    password: 'password123',
    phone: '+94770000001',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'lakmal_member2',
    email: 'lakmal.member@desynflow.com',
    password: 'password123',
    phone: '+94770000002',
    role: 'team member',
    isVerified: true,
    isActive: true
  },
  {
    username: 'buddhika_leader',
    email: 'buddhika.leader@desynflow.com',
    password: 'password123',
    phone: '+94770000003',
    role: 'team leader',
    isVerified: true,
    isActive: true
  }
];

const allUsers = [...clientUsers, ...staffUsers];

async function seedRealisticUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Cleared existing users');

    console.log('🌱 Creating realistic users...');
    
    // Create users one by one to ensure password hashing works correctly
    const createdUsers = [];
    for (const userData of allUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
    }

    console.log(`✅ Successfully created ${createdUsers.length} users`);
    console.log(`   • ${clientUsers.length} Client users`);
    console.log(`   • ${staffUsers.length} Staff users`);

    // Display client users for reference
    console.log('\\n📋 Client Users Created:');
    createdUsers.filter(user => user.role === 'client').forEach(user => {
      console.log(`   • ${user.username} (${user.email}) - ${user.role}`);
    });

    console.log('\\n👥 Staff Users Created:');
    createdUsers.filter(user => user.role !== 'client').forEach(user => {
      console.log(`   • ${user.username} (${user.email}) - ${user.role}`);
    });

    await mongoose.disconnect();
    console.log('🔚 Database connection closed');

    return createdUsers;

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRealisticUsers();
}

export { seedRealisticUsers, clientUsers, staffUsers };