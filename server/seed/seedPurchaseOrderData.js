import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
import User from '../modules/auth/model/user.model.js';
import Project from '../modules/project/model/project.model.js';
import Supplier from '../modules/supplier/model/supplier.model.js';
import Material from '../modules/supplier/model/material.model.js';
import PurchaseOrder from '../modules/supplier/model/purchaseOrder.model.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/desynflow';

async function seedPurchaseOrderData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing purchase order data...');
    const deletedPOs = await PurchaseOrder.deleteMany({});
    const deletedSuppliers = await Supplier.deleteMany({});
    const deletedMaterials = await Material.deleteMany({});
    const deletedProjects = await Project.deleteMany({});
    const deletedUsers = await User.deleteMany({});
    console.log(`   - Deleted ${deletedPOs.deletedCount} purchase orders`);
    console.log(`   - Deleted ${deletedSuppliers.deletedCount} suppliers`);
    console.log(`   - Deleted ${deletedMaterials.deletedCount} materials`);
    console.log(`   - Deleted ${deletedProjects.deletedCount} projects`);
    console.log(`   - Deleted ${deletedUsers.deletedCount} users`);

    // ==================== CREATE USERS ====================
    console.log('\n👥 Creating users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create Clients (5)
    const clients = [];
    const clientNames = [
      { username: 'john_anderson', email: 'john.anderson@email.com', phone: '+94771234567' },
      { username: 'sarah_williams', email: 'sarah.williams@email.com', phone: '+94772345678' },
      { username: 'michael_brown', email: 'michael.brown@email.com', phone: '+94773456789' },
      { username: 'emily_davis', email: 'emily.davis@email.com', phone: '+94774567890' },
      { username: 'david_miller', email: 'david.miller@email.com', phone: '+94775678901' },
    ];

    for (const clientData of clientNames) {
      const client = await User.create({
        username: clientData.username,
        email: clientData.email,
        password: hashedPassword,
        role: 'client',
        phone: clientData.phone,
        isActive: true,
      });
      clients.push(client);
    }
    console.log(`   ✅ Created ${clients.length} clients`);

    // Create Finance Managers (2)
    const financeManagers = [];
    const financeManagerData = [
      { username: 'finance_manager_1', email: 'fm1@desynflow.com', phone: '+94771234000' },
      { username: 'finance_manager_2', email: 'fm2@desynflow.com', phone: '+94772345000' },
    ];

    for (const fmData of financeManagerData) {
      const fm = await User.create({
        username: fmData.username,
        email: fmData.email,
        password: hashedPassword,
        role: 'finance manager',
        phone: fmData.phone,
        isActive: true,
      });
      financeManagers.push(fm);
    }
    console.log(`   ✅ Created ${financeManagers.length} finance managers`);

    // Create Procurement Officers (2)
    const procurementOfficers = [];
    const procurementData = [
      { username: 'procurement_officer_1', email: 'po1@desynflow.com', phone: '+94773456000' },
      { username: 'procurement_officer_2', email: 'po2@desynflow.com', phone: '+94774567000' },
    ];

    for (const poData of procurementData) {
      const po = await User.create({
        username: poData.username,
        email: poData.email,
        password: hashedPassword,
        role: 'procurement officer',
        phone: poData.phone,
        isActive: true,
      });
      procurementOfficers.push(po);
    }
    console.log(`   ✅ Created ${procurementOfficers.length} procurement officers`);

    // Create Project Managers (2)
    const projectManagers = [];
    const pmData = [
      { username: 'project_manager_1', email: 'pm1@desynflow.com', phone: '+94775678000' },
      { username: 'project_manager_2', email: 'pm2@desynflow.com', phone: '+94776789000' },
    ];

    for (const pmInfo of pmData) {
      const pm = await User.create({
        username: pmInfo.username,
        email: pmInfo.email,
        password: hashedPassword,
        role: 'project manager',
        phone: pmInfo.phone,
        isActive: true,
      });
      projectManagers.push(pm);
    }
    console.log(`   ✅ Created ${projectManagers.length} project managers`);

    // ==================== CREATE PROJECTS ====================
    console.log('\n🏗️  Creating projects...');
    
    const projectData = [
      { name: 'Luxury Villa - Mount Lavinia', budget: 15000000, client: clients[0], pm: projectManagers[0] },
      { name: 'Modern Office Complex - Colombo 03', budget: 45000000, client: clients[1], pm: projectManagers[1] },
      { name: 'Residential Apartment - Kandy', budget: 8500000, client: clients[2], pm: projectManagers[0] },
      { name: 'Beach Resort - Bentota', budget: 35000000, client: clients[3], pm: projectManagers[1] },
      { name: 'Shopping Mall - Negombo', budget: 62000000, client: clients[4], pm: projectManagers[0] },
    ];

    const projects = [];
    for (const projData of projectData) {
      const project = await Project.create({
        projectName: projData.name,
        budget: projData.budget,
        clientId: projData.client._id,
        projectManager: projData.pm._id,
        status: 'Active',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2025-12-31'),
        description: `Construction project for ${projData.name}`,
      });
      projects.push(project);
    }
    console.log(`   ✅ Created ${projects.length} projects`);

    // ==================== CREATE MATERIALS ====================
    console.log('\n📦 Creating materials...');
    
    const materialsData = [
      // Construction Materials
      { materialId: 'MAT-001', materialName: 'Cement (50kg bag)', category: 'Construction', type: 'Raw Material', unit: 'bag' },
      { materialId: 'MAT-002', materialName: 'Sand (Cubic meter)', category: 'Construction', type: 'Raw Material', unit: 'm³' },
      { materialId: 'MAT-003', materialName: 'Gravel (Cubic meter)', category: 'Construction', type: 'Raw Material', unit: 'm³' },
      { materialId: 'MAT-004', materialName: 'Steel Rebar 12mm', category: 'Construction', type: 'Raw Material', unit: 'kg' },
      { materialId: 'MAT-005', materialName: 'Bricks (Red clay)', category: 'Construction', type: 'Raw Material', unit: 'piece' },
      
      // Finishing Materials
      { materialId: 'MAT-006', materialName: 'Ceramic Floor Tiles 600x600mm', category: 'Finishing', type: 'Finished Good', unit: 'm²', warrantyPeriod: '1 year' },
      { materialId: 'MAT-007', materialName: 'Wall Paint (White) 20L', category: 'Finishing', type: 'Finished Good', unit: 'gallon', warrantyPeriod: '2 years' },
      { materialId: 'MAT-008', materialName: 'Wooden Door (Teak)', category: 'Finishing', type: 'Finished Good', unit: 'piece', warrantyPeriod: '5 years' },
      { materialId: 'MAT-009', materialName: 'Window Frame (Aluminum)', category: 'Finishing', type: 'Finished Good', unit: 'piece', warrantyPeriod: '3 years' },
      
      // Electrical
      { materialId: 'MAT-010', materialName: 'Electrical Cable 2.5mm', category: 'Electrical', type: 'Raw Material', unit: 'meter' },
      { materialId: 'MAT-011', materialName: 'LED Light Fixture', category: 'Electrical', type: 'Finished Good', unit: 'piece', warrantyPeriod: '2 years' },
      { materialId: 'MAT-012', materialName: 'Power Socket 13A', category: 'Electrical', type: 'Finished Good', unit: 'piece', warrantyPeriod: '1 year' },
      
      // Plumbing
      { materialId: 'MAT-013', materialName: 'PVC Pipe 3 inch', category: 'Plumbing', type: 'Raw Material', unit: 'meter' },
      { materialId: 'MAT-014', materialName: 'Water Tap (Chrome)', category: 'Plumbing', type: 'Finished Good', unit: 'piece', warrantyPeriod: '2 years' },
      { materialId: 'MAT-015', materialName: 'Toilet Bowl (Ceramic)', category: 'Plumbing', type: 'Finished Good', unit: 'piece', warrantyPeriod: '5 years' },
    ];

    const materials = [];
    for (const matData of materialsData) {
      const material = await Material.create(matData);
      materials.push(material);
    }
    console.log(`   ✅ Created ${materials.length} materials`);

    // ==================== CREATE SUPPLIERS ====================
    console.log('\n🏢 Creating suppliers...');
    
    const suppliersData = [
      {
        companyName: 'Lanka Cement Suppliers (Pvt) Ltd',
        contactName: 'Pradeep Fernando',
        email: 'info@lankacements.lk',
        phone: '+94112345678',
        materials: [
          { name: 'Cement (50kg bag)', pricePerUnit: 1850 },
          { name: 'Sand (Cubic meter)', pricePerUnit: 4500 },
          { name: 'Gravel (Cubic meter)', pricePerUnit: 5200 },
        ],
        deliveryRegions: ['Colombo', 'Gampaha', 'Kalutara'],
        rating: 4.5,
      },
      {
        companyName: 'Steel World Lanka',
        contactName: 'Sunil Jayawardena',
        email: 'sales@steelworld.lk',
        phone: '+94112234567',
        materials: [
          { name: 'Steel Rebar 12mm', pricePerUnit: 225 },
          { name: 'Steel Rebar 16mm', pricePerUnit: 285 },
        ],
        deliveryRegions: ['Colombo', 'Kandy', 'Galle'],
        rating: 4.8,
      },
      {
        companyName: 'Island Bricks & Tiles',
        contactName: 'Nimal Perera',
        email: 'contact@islandbricks.lk',
        phone: '+94113345678',
        materials: [
          { name: 'Bricks (Red clay)', pricePerUnit: 45 },
          { name: 'Ceramic Floor Tiles 600x600mm', pricePerUnit: 1200 },
        ],
        deliveryRegions: ['Colombo', 'Negombo', 'Gampaha'],
        rating: 4.2,
      },
      {
        companyName: 'Premium Paints Lanka',
        contactName: 'Chaminda Silva',
        email: 'info@premiumpaints.lk',
        phone: '+94114456789',
        materials: [
          { name: 'Wall Paint (White) 20L', pricePerUnit: 8500 },
          { name: 'Wall Paint (Colored) 20L', pricePerUnit: 9200 },
        ],
        deliveryRegions: ['All Island'],
        rating: 4.6,
      },
      {
        companyName: 'Teak Wood Suppliers',
        contactName: 'Anura Bandara',
        email: 'sales@teakwood.lk',
        phone: '+94115567890',
        materials: [
          { name: 'Wooden Door (Teak)', pricePerUnit: 45000 },
          { name: 'Window Frame (Teak)', pricePerUnit: 25000 },
        ],
        deliveryRegions: ['Colombo', 'Kandy', 'Kurunegala'],
        rating: 4.7,
      },
      {
        companyName: 'Modern Aluminum Works',
        contactName: 'Lasith Rajapaksa',
        email: 'info@modernaluminum.lk',
        phone: '+94116678901',
        materials: [
          { name: 'Window Frame (Aluminum)', pricePerUnit: 12500 },
          { name: 'Sliding Door (Aluminum)', pricePerUnit: 35000 },
        ],
        deliveryRegions: ['Colombo', 'Gampaha', 'Kalutara'],
        rating: 4.4,
      },
      {
        companyName: 'Electro Supplies Lanka',
        contactName: 'Ruwan Wijesinghe',
        email: 'sales@electrosupplies.lk',
        phone: '+94117789012',
        materials: [
          { name: 'Electrical Cable 2.5mm', pricePerUnit: 85 },
          { name: 'LED Light Fixture', pricePerUnit: 2500 },
          { name: 'Power Socket 13A', pricePerUnit: 350 },
        ],
        deliveryRegions: ['All Island'],
        rating: 4.3,
      },
      {
        companyName: 'Plumbing Solutions (Pvt) Ltd',
        contactName: 'Kamal Gunasekara',
        email: 'info@plumbingsolutions.lk',
        phone: '+94118890123',
        materials: [
          { name: 'PVC Pipe 3 inch', pricePerUnit: 450 },
          { name: 'Water Tap (Chrome)', pricePerUnit: 3500 },
          { name: 'Toilet Bowl (Ceramic)', pricePerUnit: 18500 },
        ],
        deliveryRegions: ['Colombo', 'Kandy', 'Galle', 'Negombo'],
        rating: 4.5,
      },
    ];

    const suppliers = [];
    for (const suppData of suppliersData) {
      const supplier = await Supplier.create(suppData);
      suppliers.push(supplier);
    }
    console.log(`   ✅ Created ${suppliers.length} suppliers`);

    // ==================== CREATE PURCHASE ORDERS ====================
    console.log('\n📝 Creating purchase orders...');
    
    const purchaseOrders = [];

    // Draft Orders (2)
    const draftOrders = [
      {
        name: 'PO-2025-001: Construction Materials for Villa',
        requestOrigin: 'Manual',
        projectId: projects[0]._id,
        supplierId: suppliers[0]._id,
        requestedBy: procurementOfficers[0]._id,
        status: 'Draft',
        items: [
          { materialId: materials[0]._id, materialName: 'Cement (50kg bag)', qty: 100, unitPrice: 1850 },
          { materialId: materials[1]._id, materialName: 'Sand (Cubic meter)', qty: 15, unitPrice: 4500 },
          { materialId: materials[2]._id, materialName: 'Gravel (Cubic meter)', qty: 10, unitPrice: 5200 },
        ],
        totalAmount: 100 * 1850 + 15 * 4500 + 10 * 5200,
      },
      {
        name: 'PO-2025-002: Steel Rebar for Office Complex',
        requestOrigin: 'ProjectMR',
        projectId: projects[1]._id,
        supplierId: suppliers[1]._id,
        requestedBy: procurementOfficers[1]._id,
        status: 'Draft',
        items: [
          { materialId: materials[3]._id, materialName: 'Steel Rebar 12mm', qty: 500, unitPrice: 225 },
        ],
        totalAmount: 500 * 225,
      },
    ];

    for (const poData of draftOrders) {
      const po = await PurchaseOrder.create(poData);
      purchaseOrders.push(po);
    }
    console.log(`   ✅ Created ${draftOrders.length} draft orders`);

    // Pending Finance Approval Orders (3)
    const pendingApprovalOrders = [
      {
        name: 'PO-2025-003: Bricks & Tiles for Villa',
        requestOrigin: 'Manual',
        projectId: projects[0]._id,
        supplierId: suppliers[2]._id,
        requestedBy: procurementOfficers[0]._id,
        status: 'PendingFinanceApproval',
        items: [
          { materialId: materials[4]._id, materialName: 'Bricks (Red clay)', qty: 5000, unitPrice: 45 },
          { materialId: materials[5]._id, materialName: 'Ceramic Floor Tiles 600x600mm', qty: 100, unitPrice: 1200 },
        ],
        totalAmount: 5000 * 45 + 100 * 1200,
        financeApproval: {
          status: 'Pending',
        },
      },
      {
        name: 'PO-2025-004: Paint Supply for Apartment',
        requestOrigin: 'ReorderAlert',
        projectId: projects[2]._id,
        supplierId: suppliers[3]._id,
        requestedBy: procurementOfficers[1]._id,
        status: 'PendingFinanceApproval',
        items: [
          { materialId: materials[6]._id, materialName: 'Wall Paint (White) 20L', qty: 50, unitPrice: 8500 },
        ],
        totalAmount: 50 * 8500,
        financeApproval: {
          status: 'Pending',
        },
      },
      {
        name: 'PO-2025-005: Teak Doors for Beach Resort',
        requestOrigin: 'ProjectMR',
        projectId: projects[3]._id,
        supplierId: suppliers[4]._id,
        requestedBy: procurementOfficers[0]._id,
        status: 'PendingFinanceApproval',
        items: [
          { materialId: materials[7]._id, materialName: 'Wooden Door (Teak)', qty: 20, unitPrice: 45000 },
        ],
        totalAmount: 20 * 45000,
        financeApproval: {
          status: 'Pending',
        },
      },
    ];

    for (const poData of pendingApprovalOrders) {
      const po = await PurchaseOrder.create(poData);
      purchaseOrders.push(po);
    }
    console.log(`   ✅ Created ${pendingApprovalOrders.length} pending approval orders`);

    // Approved Orders (2)
    const approvedOrders = [
      {
        name: 'PO-2025-006: Aluminum Windows for Office',
        requestOrigin: 'Manual',
        projectId: projects[1]._id,
        supplierId: suppliers[5]._id,
        requestedBy: procurementOfficers[1]._id,
        status: 'Approved',
        items: [
          { materialId: materials[8]._id, materialName: 'Window Frame (Aluminum)', qty: 30, unitPrice: 12500 },
        ],
        totalAmount: 30 * 12500,
        financeApproval: {
          approverId: financeManagers[0]._id,
          status: 'Approved',
          note: 'Approved for project requirements',
          approvedAt: new Date('2025-10-10'),
        },
      },
      {
        name: 'PO-2025-007: Electrical Package for Mall',
        requestOrigin: 'ProjectMR',
        projectId: projects[4]._id,
        supplierId: suppliers[6]._id,
        requestedBy: procurementOfficers[0]._id,
        status: 'Approved',
        items: [
          { materialId: materials[9]._id, materialName: 'Electrical Cable 2.5mm', qty: 500, unitPrice: 85 },
          { materialId: materials[10]._id, materialName: 'LED Light Fixture', qty: 100, unitPrice: 2500 },
          { materialId: materials[11]._id, materialName: 'Power Socket 13A', qty: 150, unitPrice: 350 },
        ],
        totalAmount: 500 * 85 + 100 * 2500 + 150 * 350,
        financeApproval: {
          approverId: financeManagers[1]._id,
          status: 'Approved',
          note: 'Approved within budget',
          approvedAt: new Date('2025-10-12'),
        },
      },
    ];

    for (const poData of approvedOrders) {
      const po = await PurchaseOrder.create(poData);
      purchaseOrders.push(po);
    }
    console.log(`   ✅ Created ${approvedOrders.length} approved orders`);

    // Rejected Orders (1)
    const rejectedOrders = [
      {
        name: 'PO-2025-008: Plumbing Items for Apartment',
        requestOrigin: 'Manual',
        projectId: projects[2]._id,
        supplierId: suppliers[7]._id,
        requestedBy: procurementOfficers[1]._id,
        status: 'Rejected',
        items: [
          { materialId: materials[12]._id, materialName: 'PVC Pipe 3 inch', qty: 200, unitPrice: 450 },
          { materialId: materials[13]._id, materialName: 'Water Tap (Chrome)', qty: 50, unitPrice: 3500 },
        ],
        totalAmount: 200 * 450 + 50 * 3500,
        financeApproval: {
          approverId: financeManagers[0]._id,
          status: 'Rejected',
          note: 'Exceeds project budget allocation',
          approvedAt: new Date('2025-10-08'),
        },
      },
    ];

    for (const poData of rejectedOrders) {
      const po = await PurchaseOrder.create(poData);
      purchaseOrders.push(po);
    }
    console.log(`   ✅ Created ${rejectedOrders.length} rejected orders`);

    // Sent to Supplier Orders (1)
    const sentToSupplierOrders = [
      {
        name: 'PO-2025-009: Foundation Materials for Villa',
        requestOrigin: 'Manual',
        projectId: projects[0]._id,
        supplierId: suppliers[0]._id,
        requestedBy: procurementOfficers[0]._id,
        status: 'SentToSupplier',
        items: [
          { materialId: materials[0]._id, materialName: 'Cement (50kg bag)', qty: 200, unitPrice: 1850 },
          { materialId: materials[1]._id, materialName: 'Sand (Cubic meter)', qty: 20, unitPrice: 4500 },
        ],
        totalAmount: 200 * 1850 + 20 * 4500,
        financeApproval: {
          approverId: financeManagers[1]._id,
          status: 'Approved',
          note: 'Approved and sent to supplier',
          approvedAt: new Date('2025-10-05'),
        },
      },
    ];

    for (const poData of sentToSupplierOrders) {
      const po = await PurchaseOrder.create(poData);
      purchaseOrders.push(po);
    }
    console.log(`   ✅ Created ${sentToSupplierOrders.length} sent to supplier orders`);

    // In Progress Orders (1)
    const inProgressOrders = [
      {
        name: 'PO-2025-010: Sanitary Ware for Resort',
        requestOrigin: 'ProjectMR',
        projectId: projects[3]._id,
        supplierId: suppliers[7]._id,
        requestedBy: procurementOfficers[1]._id,
        status: 'InProgress',
        items: [
          { materialId: materials[14]._id, materialName: 'Toilet Bowl (Ceramic)', qty: 15, unitPrice: 18500 },
          { materialId: materials[13]._id, materialName: 'Water Tap (Chrome)', qty: 30, unitPrice: 3500 },
        ],
        totalAmount: 15 * 18500 + 30 * 3500,
        financeApproval: {
          approverId: financeManagers[0]._id,
          status: 'Approved',
          note: 'Approved - supplier confirmed order',
          approvedAt: new Date('2025-10-01'),
        },
      },
    ];

    for (const poData of inProgressOrders) {
      const po = await PurchaseOrder.create(poData);
      purchaseOrders.push(po);
    }
    console.log(`   ✅ Created ${inProgressOrders.length} in progress orders`);

    // Delivered Orders (1)
    const deliveredOrders = [
      {
        name: 'PO-2025-011: Brick Supply for Mall',
        requestOrigin: 'Manual',
        projectId: projects[4]._id,
        supplierId: suppliers[2]._id,
        requestedBy: procurementOfficers[0]._id,
        status: 'Delivered',
        items: [
          { materialId: materials[4]._id, materialName: 'Bricks (Red clay)', qty: 10000, unitPrice: 45 },
        ],
        totalAmount: 10000 * 45,
        financeApproval: {
          approverId: financeManagers[1]._id,
          status: 'Approved',
          note: 'Approved and delivered',
          approvedAt: new Date('2025-09-25'),
        },
      },
    ];

    for (const poData of deliveredOrders) {
      const po = await PurchaseOrder.create(poData);
      purchaseOrders.push(po);
    }
    console.log(`   ✅ Created ${deliveredOrders.length} delivered orders`);

    // Closed Orders (1)
    const closedOrders = [
      {
        name: 'PO-2025-012: Steel Reinforcement for Office',
        requestOrigin: 'ReorderAlert',
        projectId: projects[1]._id,
        supplierId: suppliers[1]._id,
        requestedBy: procurementOfficers[1]._id,
        status: 'Closed',
        items: [
          { materialId: materials[3]._id, materialName: 'Steel Rebar 12mm', qty: 1000, unitPrice: 225 },
        ],
        totalAmount: 1000 * 225,
        financeApproval: {
          approverId: financeManagers[0]._id,
          status: 'Approved',
          note: 'Completed and closed',
          approvedAt: new Date('2025-09-20'),
        },
      },
    ];

    for (const poData of closedOrders) {
      const po = await PurchaseOrder.create(poData);
      purchaseOrders.push(po);
    }
    console.log(`   ✅ Created ${closedOrders.length} closed orders`);

    // ==================== SUMMARY ====================
    console.log('\n' + '='.repeat(60));
    console.log('📊 PURCHASE ORDER SEED DATA SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n👥 Users Created:');
    console.log(`   - Clients: ${clients.length}`);
    console.log(`   - Finance Managers: ${financeManagers.length}`);
    console.log(`   - Procurement Officers: ${procurementOfficers.length}`);
    console.log(`   - Project Managers: ${projectManagers.length}`);
    console.log(`   - Total Users: ${clients.length + financeManagers.length + procurementOfficers.length + projectManagers.length}`);

    console.log('\n🏗️  Projects Created: ${projects.length}');
    console.log('\n📦 Materials Created: ${materials.length}');
    console.log('\n🏢 Suppliers Created: ${suppliers.length}');

    console.log('\n📝 Purchase Orders Created:');
    const draftCount = purchaseOrders.filter(po => po.status === 'Draft').length;
    const pendingCount = purchaseOrders.filter(po => po.status === 'PendingFinanceApproval').length;
    const approvedCount = purchaseOrders.filter(po => po.status === 'Approved').length;
    const rejectedCount = purchaseOrders.filter(po => po.status === 'Rejected').length;
    const sentCount = purchaseOrders.filter(po => po.status === 'SentToSupplier').length;
    const inProgressCount = purchaseOrders.filter(po => po.status === 'InProgress').length;
    const deliveredCount = purchaseOrders.filter(po => po.status === 'Delivered').length;
    const closedCount = purchaseOrders.filter(po => po.status === 'Closed').length;

    console.log(`   - Total Purchase Orders: ${purchaseOrders.length}`);
    console.log(`   - Draft: ${draftCount}`);
    console.log(`   - Pending Finance Approval: ${pendingCount}`);
    console.log(`   - Approved: ${approvedCount}`);
    console.log(`   - Rejected: ${rejectedCount}`);
    console.log(`   - Sent to Supplier: ${sentCount}`);
    console.log(`   - In Progress: ${inProgressCount}`);
    console.log(`   - Delivered: ${deliveredCount}`);
    console.log(`   - Closed: ${closedCount}`);

    console.log('\n📋 Request Origins:');
    const manualCount = purchaseOrders.filter(po => po.requestOrigin === 'Manual').length;
    const reorderCount = purchaseOrders.filter(po => po.requestOrigin === 'ReorderAlert').length;
    const projectMRCount = purchaseOrders.filter(po => po.requestOrigin === 'ProjectMR').length;
    console.log(`   - Manual: ${manualCount}`);
    console.log(`   - Reorder Alert: ${reorderCount}`);
    console.log(`   - Project MR: ${projectMRCount}`);

    console.log('\n💰 Financial Summary:');
    const totalValue = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
    const pendingApprovalValue = purchaseOrders
      .filter(po => po.status === 'PendingFinanceApproval')
      .reduce((sum, po) => sum + (po.totalAmount || 0), 0);
    console.log(`   - Total PO Value: LKR ${totalValue.toLocaleString()}`);
    console.log(`   - Pending Approval Value: LKR ${pendingApprovalValue.toLocaleString()}`);

    console.log('\n🔍 Key Testing Scenarios:');
    console.log(`   ✅ Draft orders (can be edited/submitted): ${draftCount}`);
    console.log(`   ⏳ Pending approval orders (finance can approve/reject): ${pendingCount}`);
    console.log(`   ✅ Approved orders (ready to send to supplier): ${approvedCount}`);
    console.log(`   ❌ Rejected orders (for review): ${rejectedCount}`);
    console.log(`   📤 Sent to supplier orders: ${sentCount}`);
    console.log(`   🔄 In progress orders: ${inProgressCount}`);
    console.log(`   ✅ Delivered orders: ${deliveredCount}`);
    console.log(`   🔒 Closed orders: ${closedCount}`);

    console.log('\n💡 Test Cases Covered:');
    console.log('   1. ✅ Create and edit draft purchase orders');
    console.log('   2. ✅ Submit purchase orders for finance approval');
    console.log('   3. ✅ Finance manager approve/reject purchase orders');
    console.log('   4. ✅ Send approved orders to suppliers');
    console.log('   5. ✅ Track order status from draft to closed');
    console.log('   6. ✅ Multiple materials per purchase order');
    console.log('   7. ✅ Different request origins (Manual, Reorder Alert, Project MR)');
    console.log('   8. ✅ Purchase orders linked to projects and suppliers');
    console.log('   9. ✅ Total amount calculation');
    console.log('   10. ✅ Finance approval notes and timestamps');

    console.log('\n🔐 Login Credentials:');
    console.log('   Finance Manager: fm1@desynflow.com / password123');
    console.log('   Finance Manager: fm2@desynflow.com / password123');
    console.log('   Procurement Officer: po1@desynflow.com / password123');
    console.log('   Procurement Officer: po2@desynflow.com / password123');
    console.log('   Project Manager: pm1@desynflow.com / password123');
    console.log('   Client: john.anderson@email.com / password123');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Purchase Order seed data created successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error seeding purchase order data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
seedPurchaseOrderData();
