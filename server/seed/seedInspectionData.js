/**
 * Seed Inspection Management Data
 * 
 * Creates realistic dummy data for testing the Inspection Management system.
 * Includes Users (clients and finance managers), Inspection Requests, 
 * Inspection Estimations, and Payments with proper relationships.
 * 
 * Usage: node server/seed/seedInspectionData.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

// Import models
import User from '../modules/auth/model/user.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import InspectionEstimation from '../modules/finance/model/inspection_estimation.js';
import Payment from '../modules/finance/model/payment.js';

dotenv.config();

// Realistic Sri Lankan data
const sriLankanCities = [
  'Colombo', 'Kandy', 'Galle', 'Negombo', 'Mount Lavinia',
  'Dehiwala', 'Moratuwa', 'Kotte', 'Panadura', 'Kalutara',
  'Batticaloa', 'Jaffna', 'Trincomalee', 'Kurunegala', 'Anuradhapura'
];

const sriLankanStreets = [
  'Galle Road', 'Duplication Road', 'Baseline Road', 'Reid Avenue', 'Park Road',
  'Station Road', 'Main Street', 'Temple Road', 'Beach Road', 'Hill Street',
  'Lake Road', 'Railway Avenue', 'Hospital Road', 'School Lane', 'Market Street'
];

const sriLankanNames = [
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
  { first: 'Malini', last: 'Senanayake' },
  { first: 'Nuwan', last: 'Samaraweera' },
  { first: 'Chathurika', last: 'Rajapaksa' },
  { first: 'Lasith', last: 'Amarasinghe' }
];

const propertyTypes = ['residential', 'commercial', 'apartment'];

const roomNames = {
  residential: ['Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom 2', 'Bedroom 3', 'Bathroom', 'Dining Room', 'Study Room', 'Garage'],
  commercial: ['Reception', 'Office 1', 'Office 2', 'Conference Room', 'Pantry', 'Storage', 'Washroom'],
  apartment: ['Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom 2', 'Bathroom', 'Balcony']
};

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
  const prefixes = ['071', '077', '076', '075', '078', '070', '072'];
  return `${getRandomElement(prefixes)}${getRandomInt(1000000, 9999999)}`;
}

function generateEmail(firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(['gmail.com', 'yahoo.com', 'hotmail.com'])}`;
}

async function seedInspectionData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Create Users (Clients and Finance Managers)
    console.log('👥 Creating Users...');
    
    const clientUsers = [];
    const financeManagers = [];

    // Create 15 clients (more than 10 for buffer)
    for (let i = 0; i < 15; i++) {
      const name = sriLankanNames[i];
      const client = new User({
        username: `${name.first}${name.last}`,
        email: generateEmail(name.first, name.last),
        password: 'Password@123', // Will be hashed by pre-save hook
        phone: generatePhoneNumber(),
        role: 'client',
        isVerified: true,
        isActive: true
      });
      const savedClient = await client.save();
      clientUsers.push(savedClient);
      console.log(`   ✅ Created client: ${savedClient.username}`);
    }

    // Create 3 finance managers
    const financeManagerNames = [
      { first: 'Saman', last: 'Karunaratne' },
      { first: 'Nadeesha', last: 'Lakmal' },
      { first: 'Udara', last: 'Ranasinghe' }
    ];

    for (const name of financeManagerNames) {
      const manager = new User({
        username: `${name.first}${name.last}`,
        email: generateEmail(name.first, name.last),
        password: 'Admin@123',
        phone: generatePhoneNumber(),
        role: 'finance manager',
        isVerified: true,
        isActive: true
      });
      const savedManager = await manager.save();
      financeManagers.push(savedManager);
      console.log(`   ✅ Created finance manager: ${savedManager.username}`);
    }

    console.log(`\n📋 Created ${clientUsers.length} clients and ${financeManagers.length} finance managers\n`);

    // Step 2: Create Inspection Requests (10+ with various statuses)
    console.log('📝 Creating Inspection Requests...');
    
    const inspectionRequests = [];
    // Valid statuses: 'pending', 'assigned', 'in-progress', 'completed', 'cancelled'
    const statuses = ['pending', 'pending', 'pending', 'pending', 'assigned', 'assigned', 'in-progress', 'in-progress', 'completed', 'completed', 'completed', 'cancelled'];

    for (let i = 0; i < 12; i++) {
      const client = clientUsers[i];
      const propertyType = getRandomElement(propertyTypes);
      const numFloors = propertyType === 'apartment' ? 1 : getRandomInt(1, 3);
      const numRooms = getRandomInt(3, 8);
      const selectedRooms = roomNames[propertyType].slice(0, numRooms);
      
      const request = new InspectionRequest({
        client_ID: client._id,
        client_name: client.username,
        email: client.email,
        phone_number: client.phone,
        propertyLocation_address: `${getRandomInt(1, 300)} ${getRandomElement(sriLankanStreets)}`,
        propertyLocation_city: getRandomElement(sriLankanCities),
        propertyType: propertyType,
        number_of_floor: numFloors,
        number_of_room: numRooms,
        room_name: selectedRooms,
        inspection_date: i < 8 ? getRandomDate(getRandomInt(1, 30)) : null,
        status: statuses[i],
        createdAt: getRandomDate(getRandomInt(5, 60)),
        updatedAt: getRandomDate(getRandomInt(1, 5))
      });

      const savedRequest = await request.save();
      inspectionRequests.push(savedRequest);
      console.log(`   ✅ Created inspection request #${i + 1}: ${savedRequest.propertyType} in ${savedRequest.propertyLocation_city} - Status: ${savedRequest.status}`);
    }

    console.log(`\n📊 Created ${inspectionRequests.length} inspection requests\n`);

    // Step 3: Create Inspection Estimations (for requests that have estimation)
    console.log('💰 Creating Inspection Estimations...');
    
    const inspectionEstimations = [];
    
    // Create estimations for requests with status: assigned, in-progress, completed
    const requestsWithEstimation = inspectionRequests.filter(req => 
      ['assigned', 'in-progress', 'completed'].includes(req.status)
    );

    for (const request of requestsWithEstimation) {
      const distance = getRandomInt(5, 100); // Distance in km
      let baseCost = 5000; // Base inspection cost
      
      // Calculate cost based on distance and property
      const distanceCost = distance * 50; // LKR 50 per km
      const propertyCost = request.number_of_room * 1500; // LKR 1500 per room
      const floorCost = request.number_of_floor * 2000; // LKR 2000 per floor
      
      const estimatedCost = baseCost + distanceCost + propertyCost + floorCost;

      const estimation = new InspectionEstimation({
        inspectionRequestId: request._id,
        distanceKm: distance,
        estimatedCost: estimatedCost,
        createdBy: getRandomElement(financeManagers)._id,
        createdAt: new Date(request.updatedAt.getTime() + 3600000), // 1 hour after request update
        updatedAt: new Date(request.updatedAt.getTime() + 3600000)
      });

      const savedEstimation = await estimation.save();
      inspectionEstimations.push(savedEstimation);
      console.log(`   ✅ Created estimation for request in ${request.propertyLocation_city}: LKR ${estimatedCost.toLocaleString()} (${distance} km)`);
    }

    console.log(`\n💵 Created ${inspectionEstimations.length} inspection estimations\n`);

    // Step 4: Create Payments (for requests with assigned, in-progress, completed)
    console.log('💳 Creating Payments...');
    
    const payments = [];
    const requestsWithPayment = inspectionRequests.filter(req => 
      ['assigned', 'in-progress', 'completed'].includes(req.status)
    );

    for (const request of requestsWithPayment) {
      const estimation = inspectionEstimations.find(est => 
        est.inspectionRequestId.toString() === request._id.toString()
      );

      if (!estimation) continue;

      const paymentMethods = ['Bank', 'Online', 'Cash'];
      let paymentStatus = 'Pending';
      
      // Assigned = Payment Pending, In-progress = Payment Pending, Completed = Payment Approved
      if (request.status === 'completed') {
        paymentStatus = 'Approved';
      } else if (request.status === 'cancelled') {
        paymentStatus = 'Rejected';
      } else {
        paymentStatus = 'Pending'; // assigned or in-progress
      }

      const payment = new Payment({
        projectId: null, // No project yet for inspection payments
        clientId: request.client_ID,
        amount: estimation.estimatedCost,
        method: getRandomElement(paymentMethods),
        type: 'InspectionCost',
        receiptUrl: paymentStatus !== 'Pending' ? `/uploads/receipts/inspection_${request._id}_receipt.pdf` : null,
        status: paymentStatus,
        comment: paymentStatus === 'Rejected' ? 'Receipt unclear. Please resubmit with clear bank transaction proof.' : 
                 paymentStatus === 'Approved' ? 'Payment verified successfully.' : null,
        verifiedBy: paymentStatus !== 'Pending' ? getRandomElement(financeManagers)._id : null,
        createdAt: new Date(estimation.createdAt.getTime() + 7200000), // 2 hours after estimation
        updatedAt: paymentStatus !== 'Pending' ? new Date(estimation.createdAt.getTime() + 86400000) : new Date(estimation.createdAt.getTime() + 7200000) // 1 day later if verified/rejected
      });

      const savedPayment = await payment.save();
      payments.push(savedPayment);
      console.log(`   ✅ Created payment for ${request.propertyLocation_city}: LKR ${savedPayment.amount.toLocaleString()} - Status: ${savedPayment.status}`);
    }

    console.log(`\n💰 Created ${payments.length} payments\n`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60) + '\n');
    console.log(`👥 Users Created:`);
    console.log(`   - Clients: ${clientUsers.length}`);
    console.log(`   - Finance Managers: ${financeManagers.length}`);
    console.log(`\n📝 Inspection Data:`);
    console.log(`   - Inspection Requests: ${inspectionRequests.length}`);
    console.log(`     • Pending: ${inspectionRequests.filter(r => r.status === 'pending').length}`);
    console.log(`     • Assigned: ${inspectionRequests.filter(r => r.status === 'assigned').length}`);
    console.log(`     • In Progress: ${inspectionRequests.filter(r => r.status === 'in-progress').length}`);
    console.log(`     • Completed: ${inspectionRequests.filter(r => r.status === 'completed').length}`);
    console.log(`     • Cancelled: ${inspectionRequests.filter(r => r.status === 'cancelled').length}`);
    console.log(`   - Inspection Estimations: ${inspectionEstimations.length}`);
    console.log(`   - Payments: ${payments.length}`);
    console.log(`     • Pending: ${payments.filter(p => p.status === 'Pending').length}`);
    console.log(`     • Approved: ${payments.filter(p => p.status === 'Approved').length}`);
    console.log(`     • Rejected: ${payments.filter(p => p.status === 'Rejected').length}`);
    
    console.log(`\n💡 Sample Login Credentials:`);
    console.log(`   Client: ${clientUsers[0].email} / Password@123`);
    console.log(`   Finance Manager: ${financeManagers[0].email} / Admin@123`);
    
    console.log(`\n🎉 Inspection data seeded successfully!\n`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding inspection data:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Execute the script
console.log('\n' + '='.repeat(60));
console.log('🌱 SEED INSPECTION MANAGEMENT DATA');
console.log('='.repeat(60) + '\n');

seedInspectionData();

export { seedInspectionData };
