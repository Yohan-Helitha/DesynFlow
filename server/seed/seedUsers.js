import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../modules/auth/model/user.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import Assignment from '../modules/auth/model/assignment.model.js';
import InspectorLocation from '../modules/auth/model/inspectorLocation.model.js';
import Team from '../modules/project/model/team.model.js';
import Project from '../modules/project/model/project.model.js';
import Task from '../modules/project/model/task.model.js';
import MaterialRequest from '../modules/project/model/material.model.js';
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
  
  // Inspector 1 - Colombo
  {
    username: 'mike_inspector',
    email: 'mike.inspector@desynflow.com',
    password: 'inspect123',
    phone: '+94703456789',
    role: 'inspector',
    isVerified: true,
    isActive: true
  },
  
  // Inspector 2 - Kandy
  {
    username: 'priya_inspector',
    email: 'priya.inspector@desynflow.com',
    password: 'inspect123',
    phone: '+94703456790',
    role: 'inspector',
    isVerified: true,
    isActive: true
  },
  
  // Inspector 3 - Galle
  {
    username: 'rajesh_inspector',
    email: 'rajesh.inspector@desynflow.com',
    password: 'inspect123',
    phone: '+94703456791',
    role: 'inspector',
    isVerified: true,
    isActive: true
  },
  
  // Inspector 4 - Negombo
  {
    username: 'saman_inspector',
    email: 'saman.inspector@desynflow.com',
    password: 'inspect123',
    phone: '+94703456792',
    role: 'inspector',
    isVerified: true,
    isActive: true
  },
  
  // Inspector 5 - Matara
  {
    username: 'nimal_inspector',
    email: 'nimal.inspector@desynflow.com',
    password: 'inspect123',
    phone: '+94703456793',
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
  },
  
  // Third client for more testing options
  {
    username: 'bob_client3',
    email: 'bob.client@gmail.com',
    password: 'password789',
    phone: '+94719876543',
    role: 'client',
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

// Create sample teams
const createSampleTeams = async (users) => {
  try {
    // Find users by role
    const teamMembers = users.filter(u => u.role === 'team member');
    const teamLeader = users.find(u => u.role === 'team leader');
    const projectManager = users.find(u => u.role === 'project manager');
    
    if (teamMembers.length < 5 || !teamLeader) {
      console.log('❌ Not enough team members or leader found for team creation');
      return;
    }

    // Create Interior Design Team
    const interiorDesignTeam = {
      teamId: new mongoose.Types.ObjectId(),
      teamName: 'Interior Design Team',
      leaderId: teamLeader._id,
      members: teamMembers.slice(0, 5).map(member => ({
        userId: member._id,
        role: member.role,
        availability: 'Available',
        workload: 0
      })),
      active: true
    };

    // Create Project Management Team (if we have enough members)
    const projectManagementTeam = {
      teamId: new mongoose.Types.ObjectId(),
      teamName: 'Project Management Team',
      leaderId: projectManager?._id || teamLeader._id,
      members: teamMembers.slice(5, 10).map(member => ({
        userId: member._id,
        role: member.role,
        availability: 'Available',
        workload: 0
      })),
      active: true
    };

    const sampleTeams = [interiorDesignTeam];
    
    // Only add project management team if we have enough members
    if (teamMembers.length >= 10) {
      sampleTeams.push(projectManagementTeam);
    }

    const createdTeams = await Team.insertMany(sampleTeams);
    console.log(`✅ Created ${createdTeams.length} sample teams`);
    
    // Display created teams
    console.log('\n👥 Created Teams:');
    createdTeams.forEach(team => {
      console.log(`   • ${team.teamName} - Leader: ${teamLeader.username} - Members: ${team.members.length}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample teams:', error);
    throw error;
  }
};

// Create sample projects and assign teams
const createSampleProjects = async (users) => {
  try {
    // Find teams and users
    const teams = await Team.find({});
    const projectManager = users.find(u => u.role === 'project manager');
    const financeManager = users.find(u => u.role === 'finance manager');
    
    if (teams.length === 0 || !projectManager) {
      console.log('❌ No teams or project manager found for project creation');
      return;
    }

    // Sample projects
    const sampleProjects = [
      {
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Luxury Villa Interior Design',
        projectManagerId: projectManager._id,
        clientId: users.find(u => u.role === 'client')?._id,
        assignedTeamId: teams.find(t => t.teamName === 'Interior Design Team')?._id,
        startDate: new Date('2025-11-01'),
        dueDate: new Date('2026-02-28'),
        status: 'In Progress',
        progress: 25,
        milestones: [], // Will be empty for now, can be populated separately if needed
        timeline: [
          {
            name: 'Project Kickoff',
            date: new Date('2025-11-01'),
            description: 'Initial project meeting and requirements gathering'
          },
          {
            name: 'Design Phase Complete',
            date: new Date('2025-12-15'),
            description: 'All design concepts finalized and approved'
          }
        ],
        attachments: [],
        estimateCreated: true
      },
      {
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Office Space Renovation',
        projectManagerId: projectManager._id,
        clientId: users.find(u => u.email === 'jane.client@gmail.com')?._id || users.find(u => u.role === 'client')?._id,
        assignedTeamId: teams.find(t => t.teamName === 'Project Management Team')?._id,
        startDate: new Date('2025-10-15'),
        dueDate: new Date('2025-12-30'),
        status: 'Active',
        progress: 10,
        milestones: [], // Will be empty for now
        timeline: [
          {
            name: 'Planning Phase',
            date: new Date('2025-10-15'),
            description: 'Initial planning and space assessment'
          }
        ],
        attachments: [],
        estimateCreated: false
      }
    ];

    const createdProjects = await Project.insertMany(sampleProjects);
    console.log(`✅ Created ${createdProjects.length} sample projects`);
    
    // Display created projects
    console.log('\n🏗️ Created Projects:');
    createdProjects.forEach(project => {
      const team = teams.find(t => t._id.equals(project.assignedTeamId));
      console.log(`   • ${project.projectName} - Team: ${team?.teamName || 'Unassigned'} - Status: ${project.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample projects:', error);
    throw error;
  }
};

// Create sample tasks for projects
const createSampleTasks = async (users) => {
  try {
    // Find projects and team members
    const projects = await Project.find({});
    const teamMembers = users.filter(u => u.role === 'team member');
    const teamLeader = users.find(u => u.role === 'team leader');
    
    if (projects.length === 0 || teamMembers.length === 0) {
      console.log('❌ No projects or team members found for task creation');
      return;
    }

    const sampleTasks = [];

    // Create tasks for each project
    projects.forEach((project, index) => {
      const projectTasks = [
        {
          projectId: project._id,
          name: 'Project Planning & Requirements',
          description: 'Define project scope, gather requirements, and create initial project plan',
          assignedTo: teamLeader._id,
          weight: 5,
          priority: 'high',
          dueDate: new Date(project.startDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after start
          status: 'In Progress',
          progressPercentage: 60
        },
        {
          projectId: project._id,
          name: 'Design Mockups',
          description: 'Create initial design mockups and wireframes for client approval',
          assignedTo: teamMembers[index % teamMembers.length]._id,
          weight: 8,
          priority: 'high',
          dueDate: new Date(project.startDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days after start
          status: 'Pending',
          progressPercentage: 0
        },
        {
          projectId: project._id,
          name: 'Material Research',
          description: 'Research and source materials needed for the project',
          assignedTo: teamMembers[(index + 1) % teamMembers.length]._id,
          weight: 3,
          priority: 'medium',
          dueDate: new Date(project.startDate.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days after start
          status: 'Pending',
          progressPercentage: 0
        },
        {
          projectId: project._id,
          name: 'Client Presentations',
          description: 'Prepare and conduct client presentations for design approval',
          assignedTo: teamLeader._id,
          weight: 4,
          priority: 'medium',
          dueDate: new Date(project.startDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days after start
          status: 'Pending',
          progressPercentage: 0
        },
        {
          projectId: project._id,
          name: 'Quality Assurance',
          description: 'Conduct quality checks and ensure all requirements are met',
          assignedTo: teamMembers[(index + 2) % teamMembers.length]._id,
          weight: 6,
          priority: 'high',
          dueDate: new Date(project.dueDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before end
          status: 'Pending',
          progressPercentage: 0
        }
      ];
      
      sampleTasks.push(...projectTasks);
    });

    const createdTasks = await Task.insertMany(sampleTasks);
    console.log(`✅ Created ${createdTasks.length} sample tasks`);
    
    // Display created tasks summary
    console.log('\n📋 Created Tasks Summary:');
    projects.forEach(project => {
      const projectTasks = createdTasks.filter(task => task.projectId.equals(project._id));
      console.log(`   • ${project.projectName}: ${projectTasks.length} tasks`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample tasks:', error);
    throw error;
  }
};

// Create sample material requests
const createSampleMaterialRequests = async (users) => {
  try {
    // Find projects and relevant users
    const projects = await Project.find({});
    const teamLeader = users.find(u => u.role === 'team leader');
    const teamMembers = users.filter(u => u.role === 'team member');
    
    if (projects.length === 0 || !teamLeader) {
      console.log('❌ No projects or team leader found for material request creation');
      return;
    }

    const sampleMaterialRequests = [];

    // Create material requests for each project
    projects.forEach((project, index) => {
      const projectRequests = [
        {
          projectId: project._id,
          requestedBy: teamLeader._id,
          items: [
            { itemName: 'Premium Paint (White)', qty: 15 },
            { itemName: 'Paint Brushes Set', qty: 3 },
            { itemName: 'Masking Tape', qty: 10 }
          ],
          neededBy: new Date(project.startDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days after start
          status: 'Pending',
          warehouseNote: 'Required for initial phase of the project'
        },
        {
          projectId: project._id,
          requestedBy: teamMembers[index % teamMembers.length]._id,
          items: [
            { itemName: 'Hardwood Flooring', qty: 500 },
            { itemName: 'Ceramic Tiles', qty: 200 },
            { itemName: 'Adhesive', qty: 20 }
          ],
          neededBy: new Date(project.startDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days after start
          status: 'Approved',
          warehouseNote: 'Approved for flooring work phase'
        },
        {
          projectId: project._id,
          requestedBy: teamMembers[(index + 1) % teamMembers.length]._id,
          items: [
            { itemName: 'LED Light Fixtures', qty: 25 },
            { itemName: 'Electrical Wire', qty: 100 },
            { itemName: 'Switch Plates', qty: 15 }
          ],
          neededBy: new Date(project.startDate.getTime() + 35 * 24 * 60 * 60 * 1000), // 35 days after start
          status: 'Pending'
        }
      ];
      
      sampleMaterialRequests.push(...projectRequests);
    });

    const createdMaterialRequests = await MaterialRequest.insertMany(sampleMaterialRequests);
    console.log(`✅ Created ${createdMaterialRequests.length} sample material requests`);
    
    // Display created material requests summary
    console.log('\n📦 Created Material Requests Summary:');
    projects.forEach(project => {
      const projectRequests = createdMaterialRequests.filter(req => req.projectId.equals(project._id));
      console.log(`   • ${project.projectName}: ${projectRequests.length} requests`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample material requests:', error);
    throw error;
  }
};

// Seed the database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('🔗 Connected to database:', mongoose.connection.name);
    console.log('� Connection URI:', process.env.MONGO_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    // Clear existing data for fresh seed
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await InspectionRequest.deleteMany({});
    await Assignment.deleteMany({});
    await InspectorLocation.deleteMany({});
    await Team.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await MaterialRequest.deleteMany({});
    console.log('✅ Cleared existing data');
    
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
    
    // Create sample inspection requests and assignments
    console.log('\n📝 Creating sample inspection requests and assignments...');
    await createSampleData(createdUsers);
    
    // Create sample project module data
    console.log('\n👥 Creating sample teams...');
    await createSampleTeams(createdUsers);
    
    console.log('\n🏗️ Creating sample projects...');
    await createSampleProjects(createdUsers);
    
    console.log('\n📋 Creating sample tasks...');
    await createSampleTasks(createdUsers);
    
    console.log('\n📦 Creating sample material requests...');
    await createSampleMaterialRequests(createdUsers);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
};

// Create sample inspection requests and assignments
const createSampleData = async (users) => {
  try {
    // Find specific users
    const clientUser = users.find(u => u.email === 'john.client@gmail.com') || users.find(u => u.role === 'client');
    const client2User = users.find(u => u.email === 'jane.client@gmail.com') || users.find(u => u.role === 'client');
    const inspectorUser = users.find(u => u.username === 'mike_inspector') || users.find(u => u.role === 'inspector');
    
    if (!clientUser || !inspectorUser) {
      console.log('❌ Required users not found for sample data creation');
      return;
    }

    // Sample inspection requests
    const sampleRequests = [
      {
        client_ID: clientUser._id,
        client_name: 'John Smith',
        email: 'john.client@gmail.com',
        phone_number: '+94701234567',
        propertyLocation_address: '123 Main Street, Colombo 03',
        propertyLocation_city: 'Colombo',
        property_latitude: 6.9271, // Colombo 03 coordinates
        property_longitude: 79.8612,
        property_full_address: '123 Main Street, Colombo 03, Sri Lanka',
        propertyType: 'residential',
        number_of_floor: 2,
        number_of_room: 4,
        room_name: ['Living Room', 'Kitchen', 'Master Bedroom', 'Guest Bedroom'],
        inspection_date: new Date('2025-10-15'),
        status: 'pending',
        priority: 'high',
        estimated_duration: 180
      },
      {
        client_ID: client2User?._id || clientUser._id,
        client_name: 'Jane Doe',
        email: 'jane.client@gmail.com',
        phone_number: '+94709234567',
        propertyLocation_address: '456 Park Avenue, Kandy',
        propertyLocation_city: 'Kandy',
        property_latitude: 7.2906, // Kandy coordinates  
        property_longitude: 80.6337,
        property_full_address: '456 Park Avenue, Kandy, Sri Lanka',
        propertyType: 'apartment',
        number_of_floor: 1,
        number_of_room: 3,
        room_name: ['Living Room', 'Bedroom', 'Kitchen'],
        inspection_date: new Date('2025-10-20'),
        status: 'pending',
        priority: 'medium',
        estimated_duration: 120
      },
      {
        client_ID: clientUser._id,
        client_name: 'ABC Company Ltd',
        email: 'contact@abccompany.lk',
        phone_number: '+94112345678',
        propertyLocation_address: '789 Business District, Colombo 02',
        propertyLocation_city: 'Colombo',
        property_latitude: 6.9147, // Colombo 02 coordinates
        property_longitude: 79.8747,
        property_full_address: '789 Business District, Colombo 02, Sri Lanka',
        propertyType: 'commercial',
        number_of_floor: 3,
        number_of_room: 8,
        room_name: ['Reception', 'Office 1', 'Office 2', 'Conference Room', 'Kitchen', 'Storage', 'Server Room', 'Restroom'],
        inspection_date: new Date('2025-10-25'),
        status: 'pending',
        priority: 'high',
        estimated_duration: 240
      }
    ];

    // Create inspection requests
    const createdRequests = await InspectionRequest.insertMany(sampleRequests);
    console.log(`✅ Created ${createdRequests.length} sample inspection requests`);

    // Don't create assignments initially - let CSR assign them through the interface
    // This allows testing of the assignment creation process
    console.log(`✅ Created ${createdRequests.length} inspection requests available for assignment`);

    // Create sample inspector locations for map visualization
    console.log('\n📍 Creating sample inspector locations for map display...');
    
    // Find all inspector users
    const inspectorUsers = users.filter(u => u.role === 'inspector');
    
    if (inspectorUsers.length < 5) {
      console.log('❌ Not enough inspector users found for location creation');
      return;
    }
    
    // Sample inspector locations across Sri Lanka with specific inspector assignments
    const sampleInspectorLocations = [
      {
        inspector_ID: inspectorUsers.find(u => u.username === 'mike_inspector')._id,
        inspector_latitude: 6.9147, // Updated to match his current location coordinates (789 Business District, Colombo 02)
        inspector_longitude: 79.8747,
        current_address: '789 Business District, Colombo 02, Sri Lanka', // Match the location shown in inspector portal
        region: 'Colombo',
        status: 'available' // Mike has completed/declined all assignments, so he's available
      },
      {
        inspector_ID: inspectorUsers.find(u => u.username === 'priya_inspector')._id,
        inspector_latitude: 7.2906,
        inspector_longitude: 80.6337,
        current_address: 'Kandy Center, Temple Street',
        region: 'Kandy',
        status: 'available'
      },
      {
        inspector_ID: inspectorUsers.find(u => u.username === 'rajesh_inspector')._id,
        inspector_latitude: 6.0535,
        inspector_longitude: 80.2210,
        current_address: 'Galle Fort, Main Gate',
        region: 'Galle',
        status: 'busy'
      },
      {
        inspector_ID: inspectorUsers.find(u => u.username === 'saman_inspector')._id,
        inspector_latitude: 7.1644,
        inspector_longitude: 79.9344,
        current_address: 'Negombo Beach Road',
        region: 'Negombo',
        status: 'available'
      },
      {
        inspector_ID: inspectorUsers.find(u => u.username === 'nimal_inspector')._id,
        inspector_latitude: 5.9549,
        inspector_longitude: 80.5550,
        current_address: 'Matara Town Center',
        region: 'Matara',
        status: 'available'
      }
    ];

    // Check if inspector locations already exist
    const existingLocations = await InspectorLocation.find({});
    if (existingLocations.length === 0) {
      const createdLocations = await InspectorLocation.insertMany(sampleInspectorLocations);
      console.log(`✅ Created ${createdLocations.length} sample inspector locations for map visualization`);
    } else {
      console.log('ℹ️  Inspector locations already exist. Skipping location seeding...');
    }

    // Display created sample data
    console.log('\n📋 Sample Data Created:');
    createdRequests.forEach((request, index) => {
      console.log(`   • Request ${index + 1}: ${request.client_name} - ${request.propertyLocation_address}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
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