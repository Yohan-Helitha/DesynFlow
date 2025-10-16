import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import all models
import User from '../modules/auth/model/user.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import Supplier from '../modules/supplier/model/supplier.model.js';
import Material from '../modules/supplier/model/material.model.js';
import Project from '../modules/project/model/project.model.js';
import Team from '../modules/project/model/team.model.js';
import Payment from '../modules/finance/model/payment.js';

// Import seed data
import { seedRealisticUsers } from './seedRealisticUsers.js';

const mongoURI = process.env.MONGO_URI;

// Realistic Sri Lankan supplier data
const supplierData = [
  {
    companyName: 'Lanka Building Supplies',
    contactName: 'Ajith Perera',
    email: 'ajith@lankabuilding.lk',
    phone: '+94112345678',
    materialTypes: ['cement', 'steel', 'aggregate'],
    materials: [
      { name: 'Portland Cement', pricePerUnit: 1850 },
      { name: 'Steel Rods (12mm)', pricePerUnit: 185 },
      { name: 'River Sand', pricePerUnit: 4500 }
    ],
    deliveryRegions: ['Colombo', 'Gampaha', 'Kalutara'],
    rating: 4.5
  },
  {
    companyName: 'Colombo Hardware Store',
    contactName: 'Nimal Fernando',
    email: 'nimal@colombohardware.com',
    phone: '+94113456789',
    materialTypes: ['hardware', 'tools', 'electrical'],
    materials: [
      { name: 'Door Hinges', pricePerUnit: 350 },
      { name: 'PVC Pipes (4inch)', pricePerUnit: 890 },
      { name: 'Electrical Wire (2.5mm)', pricePerUnit: 45 }
    ],
    deliveryRegions: ['Colombo', 'Mount Lavinia', 'Dehiwala'],
    rating: 4.2
  },
  {
    companyName: 'Keells Building Materials',
    contactName: 'Sunil Wickramasinghe',
    email: 'sunil@keellsbuilding.lk',
    phone: '+94114567890',
    materialTypes: ['tiles', 'paint', 'plumbing'],
    materials: [
      { name: 'Ceramic Floor Tiles', pricePerUnit: 1250 },
      { name: 'Emulsion Paint (4L)', pricePerUnit: 3200 },
      { name: 'Water Taps', pricePerUnit: 2800 }
    ],
    deliveryRegions: ['Kandy', 'Matale', 'Kurunegala'],
    rating: 4.7
  },
  {
    companyName: 'Dimo Construction Supplies',
    contactName: 'Rohan de Silva',
    email: 'rohan@dimoconstruction.lk',
    phone: '+94115678901',
    materialTypes: ['timber', 'roofing', 'insulation'],
    materials: [
      { name: 'Teak Wood Planks', pricePerUnit: 8500 },
      { name: 'Roof Tiles (Clay)', pricePerUnit: 95 },
      { name: 'Foam Insulation', pricePerUnit: 450 }
    ],
    deliveryRegions: ['Negombo', 'Chilaw', 'Puttalam'],
    rating: 4.3
  },
  {
    companyName: 'Singer Building Solutions',
    contactName: 'Mahesh Rajapaksa',
    email: 'mahesh@singerbuilding.lk',
    phone: '+94116789012',
    materialTypes: ['electrical', 'fixtures', 'appliances'],
    materials: [
      { name: 'LED Light Fixtures', pricePerUnit: 1650 },
      { name: 'Ceiling Fans', pricePerUnit: 8900 },
      { name: 'Switch Panels', pricePerUnit: 780 }
    ],
    deliveryRegions: ['Galle', 'Matara', 'Hambantota'],
    rating: 4.6
  },
  {
    companyName: 'Ceylon Glass & Aluminum',
    contactName: 'Lalith Gunasekara',
    email: 'lalith@ceylonglass.lk',
    phone: '+94117890123',
    materialTypes: ['glass', 'aluminum', 'windows'],
    materials: [
      { name: 'Clear Glass Panels', pricePerUnit: 1450 },
      { name: 'Aluminum Window Frames', pricePerUnit: 12500 },
      { name: 'Sliding Door Systems', pricePerUnit: 35000 }
    ],
    deliveryRegions: ['Ratnapura', 'Kegalle', 'Avissawella'],
    rating: 4.4
  }
];

// Material catalog data
const materialData = [
  { materialId: 'MAT001', materialName: 'Portland Cement', category: 'Concrete', type: 'Raw Material', unit: 'kg', warrantyPeriod: null },
  { materialId: 'MAT002', materialName: 'Steel Reinforcement Bars', category: 'Structural', type: 'Raw Material', unit: 'kg', warrantyPeriod: null },
  { materialId: 'MAT003', materialName: 'River Sand', category: 'Aggregate', type: 'Raw Material', unit: 'cubic meter', warrantyPeriod: null },
  { materialId: 'MAT004', materialName: 'Granite Chips', category: 'Aggregate', type: 'Raw Material', unit: 'cubic meter', warrantyPeriod: null },
  { materialId: 'MAT005', materialName: 'Ceramic Floor Tiles', category: 'Finishing', type: 'Finished Product', unit: 'sq meter', warrantyPeriod: '5 years' },
  { materialId: 'MAT006', materialName: 'PVC Pipes', category: 'Plumbing', type: 'Finished Product', unit: 'meter', warrantyPeriod: '10 years' },
  { materialId: 'MAT007', materialName: 'Electrical Copper Wire', category: 'Electrical', type: 'Raw Material', unit: 'meter', warrantyPeriod: '25 years' },
  { materialId: 'MAT008', materialName: 'Aluminum Window Frames', category: 'Windows', type: 'Finished Product', unit: 'piece', warrantyPeriod: '15 years' },
  { materialId: 'MAT009', materialName: 'Roofing Tiles', category: 'Roofing', type: 'Finished Product', unit: 'piece', warrantyPeriod: '20 years' },
  { materialId: 'MAT010', materialName: 'Paint - Interior', category: 'Finishing', type: 'Finished Product', unit: 'liter', warrantyPeriod: '3 years' },
  { materialId: 'MAT011', materialName: 'Door Hardware Set', category: 'Hardware', type: 'Finished Product', unit: 'set', warrantyPeriod: '5 years' },
  { materialId: 'MAT012', materialName: 'Bathroom Fixtures', category: 'Plumbing', type: 'Finished Product', unit: 'set', warrantyPeriod: '7 years' },
  { materialId: 'MAT013', materialName: 'LED Light Fixtures', category: 'Electrical', type: 'Finished Product', unit: 'piece', warrantyPeriod: '2 years' },
  { materialId: 'MAT014', materialName: 'Teak Wood Planks', category: 'Timber', type: 'Raw Material', unit: 'cubic foot', warrantyPeriod: null },
  { materialId: 'MAT015', materialName: 'Glass Panels', category: 'Windows', type: 'Raw Material', unit: 'sq meter', warrantyPeriod: '10 years' }
];

async function seedComprehensiveData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      InspectionRequest.deleteMany({}),
      Supplier.deleteMany({}),
      Material.deleteMany({}),
      Project.deleteMany({}),
      Team.deleteMany({}),
      Payment.deleteMany({})
    ]);
    console.log('✅ Cleared existing data');

    // 1. Create Users
    console.log('\\n👥 Creating users...');
    
    // Create users directly instead of calling the function that disconnects
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
    
    // Create users one by one to ensure password hashing works correctly
    const users = [];
    for (const userData of allUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      users.push(savedUser);
    }
    console.log(`✅ Created ${users.length} users`);

    // Get user references by role
    const clients = users.filter(u => u.role === 'client');
    const managers = users.filter(u => u.role === 'manager');
    const projectManagers = users.filter(u => u.role === 'project manager');
    const inspectors = users.filter(u => u.role === 'inspector');
    const teamMembers = users.filter(u => u.role === 'team member');
    const teamLeaders = users.filter(u => u.role === 'team leader');
    const financeManagers = users.filter(u => u.role === 'finance manager');

    // 2. Create Suppliers
    console.log('\\n🏢 Creating suppliers...');
    const suppliers = await Supplier.insertMany(supplierData);
    console.log(`✅ Created ${suppliers.length} suppliers`);

    // 3. Create Materials
    console.log('\\n🧱 Creating materials...');
    const materials = await Material.insertMany(materialData);
    console.log(`✅ Created ${materials.length} materials`);

    // 4. Create Teams
    console.log('\\n👨‍👩‍👧‍👦 Creating teams...');
    const teamData = [
      {
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Alpha Construction Team',
        leaderId: teamLeaders[0]._id,
        members: [
          { userId: teamMembers[0]._id, role: 'Mason', availability: 'Available', workload: 60 },
          { userId: teamMembers[1]._id, role: 'Electrician', availability: 'Available', workload: 40 }
        ],
        active: true
      },
      {
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Beta Renovation Team',
        leaderId: teamLeaders[0]._id,
        members: [
          { userId: teamMembers[0]._id, role: 'Plumber', availability: 'Busy', workload: 80 },
          { userId: teamMembers[1]._id, role: 'Painter', availability: 'Available', workload: 30 }
        ],
        active: true
      }
    ];
    const teams = await Team.insertMany(teamData);
    console.log(`✅ Created ${teams.length} teams`);

    // 5. Create Inspection Requests
    console.log('\\n🔍 Creating inspection requests...');
    const inspectionRequests = [];
    for (let i = 0; i < 12; i++) {
      const client = clients[i % clients.length];
      const inspectionRequest = {
        client_ID: client._id,
        client_name: client.username.replace('_', ' '),
        email: client.email,
        phone_number: client.phone,
        propertyLocation_address: `${Math.floor(Math.random() * 999) + 1}, ${['Galle Road', 'Kandy Road', 'High Level Road', 'Baseline Road'][Math.floor(Math.random() * 4)]}`,
        propertyLocation_city: ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Matara'][Math.floor(Math.random() * 5)],
        propertyType: ['residential', 'commercial', 'apartment'][Math.floor(Math.random() * 3)],
        number_of_floor: Math.floor(Math.random() * 3) + 1,
        number_of_room: Math.floor(Math.random() * 6) + 2,
        room_name: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom'],
        inspection_date: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        status: ['pending', 'assigned', 'in-progress', 'completed'][Math.floor(Math.random() * 4)]
      };
      inspectionRequests.push(inspectionRequest);
    }
    const createdInspectionRequests = await InspectionRequest.insertMany(inspectionRequests);
    console.log(`✅ Created ${createdInspectionRequests.length} inspection requests`);

    // 6. Create Projects
    console.log('\\n🏗️ Creating projects...');
    const projects = [];
    for (let i = 0; i < 10; i++) {
      const client = clients[i % clients.length];
      const projectManager = projectManagers[i % projectManagers.length];
      const team = teams[i % teams.length];
      const inspectionRequest = createdInspectionRequests[i % createdInspectionRequests.length];
      
      const project = {
        projectId: new mongoose.Types.ObjectId(),
        projectName: [
          'Modern Villa Construction',
          'Office Building Renovation',
          'Apartment Complex Development',
          'Restaurant Interior Design',
          'Shopping Mall Construction',
          'Hospital Wing Extension',
          'School Building Upgrade',
          'Hotel Resort Development',
          'Warehouse Construction',
          'Residential Complex'
        ][i],
        inspectionId: inspectionRequest._id,
        projectManagerId: projectManager._id,
        clientId: client._id,
        assignedTeamId: team._id,
        status: ['Active', 'In Progress', 'Completed', 'On Hold'][Math.floor(Math.random() * 4)],
        progress: Math.floor(Math.random() * 100),
        startDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
        timeline: [
          {
            name: 'Project Kickoff',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            description: 'Initial project meeting and planning'
          },
          {
            name: 'Foundation Work',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            description: 'Foundation laying and structural work'
          }
        ],
        archived: false,
        estimateCreated: Math.random() > 0.5
      };
      projects.push(project);
    }
    const createdProjects = await Project.insertMany(projects);
    console.log(`✅ Created ${createdProjects.length} projects`);

    // 7. Create Payments
    console.log('\\n💰 Creating payments...');
    const payments = [];
    for (let i = 0; i < 15; i++) {
      const project = createdProjects[i % createdProjects.length];
      const client = clients.find(c => c._id.equals(project.clientId));
      const financeManager = financeManagers[0];

      const payment = {
        projectId: project._id,
        clientId: client._id,
        amount: Math.floor(Math.random() * 500000) + 50000, // LKR 50,000 to 550,000
        method: ['Bank', 'Online', 'Cash'][Math.floor(Math.random() * 3)],
        type: ['InspectionCost', 'ProjectPayment', 'Advance'][Math.floor(Math.random() * 3)],
        status: ['Pending', 'Approved', 'Rejected'][Math.floor(Math.random() * 3)],
        comment: i % 3 === 0 ? 'Payment verified and approved' : null,
        verifiedBy: Math.random() > 0.5 ? financeManager._id : null
      };
      payments.push(payment);
    }
    const createdPayments = await Payment.insertMany(payments);
    console.log(`✅ Created ${createdPayments.length} payments`);

    // Summary
    console.log('\\n📊 DATABASE SEEDING SUMMARY');
    console.log('=' + '='.repeat(40));
    console.log(`👥 Users: ${users.length} (${clients.length} clients, ${users.length - clients.length} staff)`);
    console.log(`🏢 Suppliers: ${suppliers.length}`);
    console.log(`🧱 Materials: ${materials.length}`);
    console.log(`👨‍👩‍👧‍👦 Teams: ${teams.length}`);
    console.log(`🔍 Inspection Requests: ${createdInspectionRequests.length}`);
    console.log(`🏗️ Projects: ${createdProjects.length}`);
    console.log(`💰 Payments: ${createdPayments.length}`);
    console.log('=' + '='.repeat(40));

    await mongoose.disconnect();
    console.log('🔚 Database connection closed');
    console.log('✅ Comprehensive database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding comprehensive data:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedComprehensiveData();
}

export default seedComprehensiveData;