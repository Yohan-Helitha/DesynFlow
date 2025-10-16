/**
 * Seed Project Estimations Management Data
 * 
 * Creates realistic dummy data for testing the Project Estimations system.
 * Includes Users (clients, project managers, finance managers), Projects,
 * Inspection Requests, Project Estimations, Quotations, Materials, and Teams.
 * 
 * Usage: node server/seed/seedEstimationData.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

// Import models
import User from '../modules/auth/model/user.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import Project from '../modules/project/model/project.model.js';
import Team from '../modules/project/model/team.model.js';
import ProjectEstimation from '../modules/finance/model/project_estimation.js';
import QuotationEstimation from '../modules/finance/model/quotation_estimation.js';
import Material from '../modules/supplier/model/material.model.js';

dotenv.config();

// Realistic Sri Lankan data
const sriLankanCities = [
  'Colombo', 'Kandy', 'Galle', 'Negombo', 'Mount Lavinia',
  'Dehiwala', 'Moratuwa', 'Kotte', 'Nugegoda', 'Maharagama'
];

const projectTypes = [
  'Residential House Construction',
  'Commercial Building Construction',
  'Apartment Complex',
  'Villa Construction',
  'Office Building',
  'Retail Complex',
  'Restaurant Construction',
  'Warehouse Construction',
  'School Building',
  'Hospital Extension'
];

const materialCategories = [
  { category: 'Building Materials', type: 'Cement', unit: 'Bag' },
  { category: 'Building Materials', type: 'Steel', unit: 'Kg' },
  { category: 'Building Materials', type: 'Sand', unit: 'Cube' },
  { category: 'Building Materials', type: 'Aggregate', unit: 'Cube' },
  { category: 'Finishing Materials', type: 'Paint', unit: 'Liter' },
  { category: 'Finishing Materials', type: 'Tiles', unit: 'SqFt' },
  { category: 'Electrical', type: 'Wiring', unit: 'Meter' },
  { category: 'Electrical', type: 'Switches', unit: 'Piece' },
  { category: 'Plumbing', type: 'PVC Pipes', unit: 'Meter' },
  { category: 'Plumbing', type: 'Fittings', unit: 'Piece' },
  { category: 'Hardware', type: 'Door Locks', unit: 'Piece' },
  { category: 'Hardware', type: 'Hinges', unit: 'Piece' },
  { category: 'Roofing', type: 'Roof Tiles', unit: 'Piece' },
  { category: 'Roofing', type: 'Metal Sheets', unit: 'Sheet' },
  { category: 'Wood', type: 'Timber', unit: 'CubicFt' }
];

const laborTasks = [
  'Foundation Work',
  'Brickwork',
  'Plastering',
  'Electrical Installation',
  'Plumbing Installation',
  'Carpentry',
  'Painting',
  'Roofing',
  'Tiling',
  'Finishing Work'
];

const services = [
  'Architectural Design',
  'Structural Engineering',
  'MEP Design',
  'Project Management',
  'Quality Inspection',
  'Site Supervision'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date;
}

function generatePhoneNumber() {
  const prefixes = ['071', '077', '076', '075', '078'];
  return `${getRandomElement(prefixes)}${getRandomInt(1000000, 9999999)}`;
}

async function seedEstimationData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Create Users
    console.log('👥 Creating Users...');
    
    const clientNames = [
      { first: 'Nimal', last: 'Silva' },
      { first: 'Kumari', last: 'Fernando' },
      { first: 'Ajith', last: 'Perera' },
      { first: 'Sanduni', last: 'Jayawardena' },
      { first: 'Rohan', last: 'Mendis' },
      { first: 'Dilini', last: 'Wijesinghe' },
      { first: 'Chaminda', last: 'Rathnayake' },
      { first: 'Priyanka', last: 'Dissanayake' },
      { first: 'Thilina', last: 'Gunawardena' },
      { first: 'Nishani', last: 'Bandara' },
      { first: 'Kasun', last: 'Wickramasinghe' },
      { first: 'Malini', last: 'Senanayake' }
    ];

    const clients = [];
    for (const name of clientNames) {
      const client = new User({
        username: `${name.first}${name.last}`,
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@gmail.com`,
        password: 'Client@123',
        phone: generatePhoneNumber(),
        role: 'client',
        isVerified: true,
        isActive: true
      });
      const saved = await client.save();
      clients.push(saved);
      console.log(`   ✅ Created client: ${saved.username}`);
    }

    // Create Project Managers
    const pmNames = [
      { first: 'Saman', last: 'Karunaratne' },
      { first: 'Nadeesha', last: 'Lakmal' },
      { first: 'Udara', last: 'Ranasinghe' }
    ];

    const projectManagers = [];
    for (const name of pmNames) {
      const pm = new User({
        username: `${name.first}${name.last}`,
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@desynflow.com`,
        password: 'PM@123',
        phone: generatePhoneNumber(),
        role: 'project manager',
        isVerified: true,
        isActive: true
      });
      const saved = await pm.save();
      projectManagers.push(saved);
      console.log(`   ✅ Created project manager: ${saved.username}`);
    }

    // Create Finance Managers
    const fmNames = [
      { first: 'Ravi', last: 'Gunasekara' },
      { first: 'Nadeeka', last: 'Perera' }
    ];

    const financeManagers = [];
    for (const name of fmNames) {
      const fm = new User({
        username: `${name.first}${name.last}`,
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@desynflow.com`,
        password: 'Finance@123',
        phone: generatePhoneNumber(),
        role: 'finance manager',
        isVerified: true,
        isActive: true
      });
      const saved = await fm.save();
      financeManagers.push(saved);
      console.log(`   ✅ Created finance manager: ${saved.username}`);
    }

    // Create Team Members
    const teamMemberNames = [
      { first: 'Kasun', last: 'Bandara' },
      { first: 'Shani', last: 'Jayasinghe' },
      { first: 'Dilshan', last: 'Amarasinghe' },
      { first: 'Sachini', last: 'Weerasinghe' },
      { first: 'Tharaka', last: 'Rajapaksa' },
      { first: 'Nimali', last: 'Dissanayake' }
    ];

    const teamMembers = [];
    for (const name of teamMemberNames) {
      const member = new User({
        username: `${name.first}${name.last}`,
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@desynflow.com`,
        password: 'Team@123',
        phone: generatePhoneNumber(),
        role: 'team member',
        isVerified: true,
        isActive: true
      });
      const saved = await member.save();
      teamMembers.push(saved);
      console.log(`   ✅ Created team member: ${saved.username}`);
    }

    console.log(`\n📋 Created ${clients.length} clients, ${projectManagers.length} project managers, ${financeManagers.length} finance managers, ${teamMembers.length} team members\n`);

    // Step 2: Create Materials
    console.log('📦 Creating Materials...');
    
    const materials = [];
    for (let i = 0; i < materialCategories.length; i++) {
      const mat = materialCategories[i];
      const material = new Material({
        materialId: `MAT-${1000 + i}`,
        materialName: mat.type,
        category: mat.category,
        type: mat.type,
        unit: mat.unit,
        warrantyPeriod: ['Cement', 'Sand', 'Aggregate', 'Paint'].includes(mat.type) ? null : '12 months'
      });
      const saved = await material.save();
      materials.push(saved);
      console.log(`   ✅ Created material: ${saved.materialName} (${saved.unit})`);
    }

    console.log(`\n📦 Created ${materials.length} materials\n`);

    // Step 3: Create Teams
    console.log('👷 Creating Teams...');
    
    const teams = [];
    const teamConfigs = [
      { name: 'Team Alpha', leader: projectManagers[0], members: [teamMembers[0], teamMembers[1]] },
      { name: 'Team Beta', leader: projectManagers[1], members: [teamMembers[2], teamMembers[3]] },
      { name: 'Team Gamma', leader: projectManagers[2], members: [teamMembers[4], teamMembers[5]] }
    ];

    for (const config of teamConfigs) {
      const team = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: config.name,
        leaderId: config.leader._id,
        members: config.members.map(m => ({
          userId: m._id,
          role: 'team member',
          availability: 'Available',
          workload: getRandomInt(20, 60)
        })),
        active: true
      });
      const saved = await team.save();
      teams.push(saved);
      console.log(`   ✅ Created team: ${saved.teamName} (Leader: ${config.leader.username})`);
    }

    console.log(`\n👷 Created ${teams.length} teams\n`);

    // Step 4: Create Inspection Requests
    console.log('📝 Creating Inspection Requests...');
    
    const inspectionRequests = [];
    for (let i = 0; i < 12; i++) {
      const client = clients[i];
      const city = getRandomElement(sriLankanCities);
      
      const request = new InspectionRequest({
        client_ID: client._id,
        client_name: client.username,
        email: client.email,
        phone_number: client.phone,
        propertyLocation_address: `${getRandomInt(1, 300)} ${getRandomElement(['Galle Road', 'Main Street', 'Station Road', 'Temple Road'])}`,
        propertyLocation_city: city,
        propertyType: getRandomElement(['residential', 'commercial', 'apartment']),
        number_of_floor: getRandomInt(1, 3),
        number_of_room: getRandomInt(4, 10),
        room_name: ['Living Room', 'Kitchen', 'Bedroom 1', 'Bedroom 2'],
        inspection_date: getRandomDate(getRandomInt(20, 60)),
        status: 'completed',
        createdAt: getRandomDate(getRandomInt(60, 90))
      });

      const saved = await request.save();
      inspectionRequests.push(saved);
      console.log(`   ✅ Created inspection request for ${saved.propertyLocation_city}`);
    }

    console.log(`\n📝 Created ${inspectionRequests.length} inspection requests\n`);

    // Step 5: Create Projects
    console.log('🏗️ Creating Projects...');
    
    const projects = [];
    const projectStatuses = ['Active', 'Active', 'Active', 'Active', 'In Progress', 'In Progress', 'In Progress', 'In Progress', 'Active', 'Active', 'On Hold', 'Active'];

    for (let i = 0; i < 12; i++) {
      const project = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: `${projectTypes[i]} - ${sriLankanCities[i % sriLankanCities.length]}`,
        inspectionId: inspectionRequests[i]._id,
        projectManagerId: projectManagers[i % projectManagers.length]._id,
        clientId: clients[i]._id,
        assignedTeamId: teams[i % teams.length]._id,
        status: projectStatuses[i],
        progress: i < 4 ? 0 : i < 8 ? getRandomInt(20, 60) : getRandomInt(5, 30),
        startDate: getRandomDate(getRandomInt(10, 40)),
        dueDate: new Date(Date.now() + getRandomInt(60, 180) * 24 * 60 * 60 * 1000),
        estimateCreated: i >= 8, // Last 4 projects have estimates
        createdAt: getRandomDate(getRandomInt(50, 80))
      });

      const saved = await project.save();
      projects.push(saved);
      console.log(`   ✅ Created project: ${saved.projectName.substring(0, 50)}... (${saved.status})`);
    }

    console.log(`\n🏗️ Created ${projects.length} projects\n`);

    // Step 6: Create Project Estimations
    console.log('💰 Creating Project Estimations...');
    
    const projectEstimations = [];
    const estimationStatuses = ['Pending', 'Pending', 'Pending', 'Pending', 'Approved', 'Approved', 'Approved', 'Rejected', 'Approved', 'Approved', 'Pending', 'Approved'];

    // Create estimations for all projects
    for (let i = 0; i < 12; i++) {
      const project = projects[i];
      const numRooms = inspectionRequests[i].number_of_room;
      const numFloors = inspectionRequests[i].number_of_floor;
      
      // Calculate realistic costs
      const laborCost = numRooms * 150000 + numFloors * 200000; // LKR per room/floor
      const materialCost = numRooms * 180000 + numFloors * 250000;
      const serviceCost = (laborCost + materialCost) * 0.15; // 15% of labor+material
      const contingencyCost = (laborCost + materialCost + serviceCost) * 0.10; // 10% contingency

      const estimation = new ProjectEstimation({
        projectId: project._id,
        version: 1,
        laborCost: Math.round(laborCost),
        materialCost: Math.round(materialCost),
        serviceCost: Math.round(serviceCost),
        contingencyCost: Math.round(contingencyCost),
        createdBy: getRandomElement(financeManagers)._id,
        status: estimationStatuses[i],
        quotationCreated: i >= 5, // Projects 5+ have quotations
        createdAt: new Date(project.createdAt.getTime() + 86400000), // 1 day after project
        updatedAt: new Date(project.createdAt.getTime() + 172800000) // 2 days after project
      });

      const saved = await estimation.save();
      projectEstimations.push(saved);
      console.log(`   ✅ Created estimation for "${project.projectName.substring(0, 40)}...": LKR ${saved.total.toLocaleString()} (${saved.status})`);
    }

    console.log(`\n💰 Created ${projectEstimations.length} project estimations\n`);

    // Step 7: Create Quotations (for approved estimations)
    console.log('📄 Creating Quotations...');
    
    const quotations = [];
    const projectsWithQuotations = projectEstimations.filter(est => est.quotationCreated);

    for (const estimation of projectsWithQuotations) {
      const project = projects.find(p => p._id.toString() === estimation.projectId.toString());
      
      // Create detailed line items
      const numLaborTasks = getRandomInt(5, 8);
      const laborItems = [];
      for (let i = 0; i < numLaborTasks; i++) {
        const hours = getRandomInt(40, 200);
        const rate = getRandomInt(500, 1500);
        laborItems.push({
          task: laborTasks[i % laborTasks.length],
          hours,
          rate,
          total: hours * rate
        });
      }

      const numMaterials = getRandomInt(6, 10);
      const materialItems = [];
      for (let i = 0; i < numMaterials; i++) {
        const material = materials[i % materials.length];
        const quantity = getRandomInt(50, 500);
        const unitPrice = getRandomInt(100, 5000);
        materialItems.push({
          materialId: material._id,
          description: material.materialName,
          quantity,
          unitPrice,
          total: quantity * unitPrice
        });
      }

      const numServices = getRandomInt(3, 5);
      const serviceItems = [];
      for (let i = 0; i < numServices; i++) {
        serviceItems.push({
          service: services[i % services.length],
          cost: getRandomInt(50000, 200000)
        });
      }

      const contingencyItems = [
        { description: 'Weather Delays', amount: Math.round(estimation.contingencyCost * 0.4) },
        { description: 'Price Fluctuation', amount: Math.round(estimation.contingencyCost * 0.3) },
        { description: 'Miscellaneous', amount: Math.round(estimation.contingencyCost * 0.3) }
      ];

      const subtotal = estimation.laborCost + estimation.materialCost + estimation.serviceCost;
      const totalContingency = estimation.contingencyCost;
      const taxRate = 0; // No tax for now
      const totalTax = Math.round(subtotal * taxRate);
      const grandTotal = subtotal + totalContingency + totalTax;

      const quotation = new QuotationEstimation({
        projectId: project._id,
        estimateVersion: estimation.version,
        version: 1,
        status: estimation.status === 'Approved' ? 'Sent' : 'Draft',
        locked: estimation.status === 'Approved',
        remarks: estimation.status === 'Approved' 
          ? 'Approved and sent to client for review.' 
          : 'Draft quotation pending review.',
        createdBy: estimation.createdBy,
        updatedBy: estimation.createdBy,
        sentTo: estimation.status === 'Approved' ? project.clientId : null,
        sentAt: estimation.status === 'Approved' ? new Date(estimation.updatedAt.getTime() + 3600000) : null,
        fileUrl: estimation.status === 'Approved' ? `/uploads/quotations/quotation_${project._id}_v1_1.pdf` : null,
        laborItems,
        materialItems,
        serviceItems,
        contingencyItems,
        taxes: taxRate > 0 ? [{ description: 'VAT', percentage: taxRate * 100, amount: totalTax }] : [],
        subtotal,
        totalContingency,
        totalTax,
        grandTotal,
        createdAt: new Date(estimation.updatedAt.getTime() + 7200000), // 2 hours after estimation
        updatedAt: new Date(estimation.updatedAt.getTime() + 10800000) // 3 hours after estimation
      });

      const saved = await quotation.save();
      quotations.push(saved);
      
      // Update estimation with quotation reference
      estimation.lastQuotationId = saved._id;
      await estimation.save();

      console.log(`   ✅ Created quotation for "${project.projectName.substring(0, 40)}...": Version ${saved.version} (${saved.status})`);
    }

    console.log(`\n📄 Created ${quotations.length} quotations\n`);

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(70) + '\n');
    
    console.log(`👥 Users Created:`);
    console.log(`   - Clients: ${clients.length}`);
    console.log(`   - Project Managers: ${projectManagers.length}`);
    console.log(`   - Finance Managers: ${financeManagers.length}`);
    console.log(`   - Team Members: ${teamMembers.length}`);
    console.log(`   - Total: ${clients.length + projectManagers.length + financeManagers.length + teamMembers.length}`);
    
    console.log(`\n🏗️ Project Data:`);
    console.log(`   - Projects: ${projects.length}`);
    console.log(`     • Active: ${projects.filter(p => p.status === 'Active').length}`);
    console.log(`     • In Progress: ${projects.filter(p => p.status === 'In Progress').length}`);
    console.log(`     • On Hold: ${projects.filter(p => p.status === 'On Hold').length}`);
    
    console.log(`\n💰 Estimation Data:`);
    console.log(`   - Project Estimations: ${projectEstimations.length}`);
    console.log(`     • Pending: ${projectEstimations.filter(e => e.status === 'Pending').length}`);
    console.log(`     • Approved: ${projectEstimations.filter(e => e.status === 'Approved').length}`);
    console.log(`     • Rejected: ${projectEstimations.filter(e => e.status === 'Rejected').length}`);
    console.log(`   - Quotations: ${quotations.length}`);
    console.log(`     • Draft: ${quotations.filter(q => q.status === 'Draft').length}`);
    console.log(`     • Sent: ${quotations.filter(q => q.status === 'Sent').length}`);
    
    console.log(`\n📦 Supporting Data:`);
    console.log(`   - Materials: ${materials.length}`);
    console.log(`   - Teams: ${teams.length}`);
    console.log(`   - Inspection Requests: ${inspectionRequests.length}`);

    const totalCost = projectEstimations.reduce((sum, est) => sum + est.total, 0);
    const avgCost = totalCost / projectEstimations.length;
    console.log(`\n💵 Financial Summary:`);
    console.log(`   - Total Estimated Value: LKR ${totalCost.toLocaleString()}`);
    console.log(`   - Average per Project: LKR ${Math.round(avgCost).toLocaleString()}`);
    console.log(`   - Cost Range: LKR ${Math.min(...projectEstimations.map(e => e.total)).toLocaleString()} - ${Math.max(...projectEstimations.map(e => e.total)).toLocaleString()}`);
    
    console.log(`\n💡 Sample Login Credentials:`);
    console.log(`   Client: ${clients[0].email} / Client@123`);
    console.log(`   Project Manager: ${projectManagers[0].email} / PM@123`);
    console.log(`   Finance Manager: ${financeManagers[0].email} / Finance@123`);
    
    console.log(`\n🎉 Project Estimation data seeded successfully!\n`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding estimation data:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Execute the script
console.log('\n' + '='.repeat(70));
console.log('🌱 SEED PROJECT ESTIMATIONS MANAGEMENT DATA');
console.log('='.repeat(70) + '\n');

seedEstimationData();

export { seedEstimationData };
