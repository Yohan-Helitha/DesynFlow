import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import User from '../modules/auth/model/user.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import Project from '../modules/project/model/project.model.js';
import Material from '../modules/supplier/model/material.model.js';
import Supplier from '../modules/supplier/model/supplier.model.js';
import PurchaseOrder from '../modules/supplier/model/purchaseOrder.model.js';
import InspectionEstimate from '../modules/finance/model/inspection_estimation.js';
import ProjectEstimation from '../modules/finance/model/project_estimation.js';
import QuotationEstimation from '../modules/finance/model/quotation_estimation.js';
import Payment from '../modules/finance/model/payment.js';
import Expense from '../modules/finance/model/expenses.js';
import Warranty from '../modules/finance/model/warrenty.js';
import WarrantyClaim from '../modules/finance/model/warrenty_claim.js';
import Notification from '../modules/finance/model/notification.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/desynflow';

// Helper to get random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

async function clearAllExceptUsers() {
  console.log('🗑️  Clearing all collections except Users...');
  
  await InspectionRequest.deleteMany({});
  await Project.deleteMany({});
  await Material.deleteMany({});
  await Supplier.deleteMany({});
  await PurchaseOrder.deleteMany({});
  await InspectionEstimate.deleteMany({});
  await ProjectEstimation.deleteMany({});
  await QuotationEstimation.deleteMany({});
  await Payment.deleteMany({});
  await Expense.deleteMany({});
  await Warranty.deleteMany({});
  await WarrantyClaim.deleteMany({});
  await Notification.deleteMany({});
  
  console.log('✅ All collections cleared (except Users)');
}

async function seedFinanceData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📊 Connected to MongoDB');

    // Clear data
    await clearAllExceptUsers();

    // Get existing users by role
    const clients = await User.find({ role: 'client' }).limit(10);
    const financeManagers = await User.find({ role: 'finance manager' }).limit(5);
    const projectManagers = await User.find({ role: 'project manager' }).limit(5);
    const inspectors = await User.find({ role: 'inspector' }).limit(3);
    const procurementOfficers = await User.find({ role: 'procurement officer' }).limit(3);

    if (clients.length === 0) {
      console.error('❌ No clients found. Please seed users first.');
      process.exit(1);
    }

    console.log(`Found ${clients.length} clients, ${financeManagers.length} finance managers, ${projectManagers.length} project managers`);

    const financeManager = financeManagers[0] || clients[0];
    const procurementOfficer = procurementOfficers[0] || clients[0];

    // ==================== STEP 1: Materials ====================
    console.log('\n📦 Creating Materials...');
    const materials = await Material.insertMany([
      { materialId: 'MAT-CEMENT-001', materialName: 'Portland Cement Type I', category: 'Construction', type: 'Raw Material', unit: 'bag', warrantyPeriod: null },
      { materialId: 'MAT-STEEL-001', materialName: 'Steel Reinforcement Bar 12mm', category: 'Construction', type: 'Raw Material', unit: 'kg', warrantyPeriod: null },
      { materialId: 'MAT-TILE-001', materialName: 'Ceramic Floor Tiles 60x60cm', category: 'Finishing', type: 'Finished Product', unit: 'box', warrantyPeriod: '12 months' },
      { materialId: 'MAT-PAINT-001', materialName: 'Exterior Acrylic Paint White', category: 'Finishing', type: 'Raw Material', unit: 'liter', warrantyPeriod: '24 months' },
      { materialId: 'MAT-WOOD-001', materialName: 'Teak Wood Planks Grade A', category: 'Carpentry', type: 'Raw Material', unit: 'm3', warrantyPeriod: null },
      { materialId: 'MAT-GLASS-001', materialName: 'Tempered Glass 8mm', category: 'Windows', type: 'Finished Product', unit: 'm2', warrantyPeriod: '36 months' },
      { materialId: 'MAT-HVAC-001', materialName: 'Central AC Unit 5-Ton', category: 'HVAC', type: 'Finished Product', unit: 'unit', warrantyPeriod: '60 months' },
      { materialId: 'MAT-ELEC-001', materialName: 'Electrical Cable 2.5mm Copper', category: 'Electrical', type: 'Raw Material', unit: 'meter', warrantyPeriod: null },
      { materialId: 'MAT-PLUMB-001', materialName: 'PVC Pipe 4-inch Schedule 40', category: 'Plumbing', type: 'Raw Material', unit: 'meter', warrantyPeriod: null },
      { materialId: 'MAT-DOOR-001', materialName: 'Solid Oak Interior Door', category: 'Carpentry', type: 'Finished Product', unit: 'unit', warrantyPeriod: '24 months' },
      { materialId: 'MAT-WINDOW-001', materialName: 'Aluminum Window Frame with Glass', category: 'Windows', type: 'Finished Product', unit: 'unit', warrantyPeriod: '36 months' },
      { materialId: 'MAT-ROOF-001', materialName: 'Clay Roof Tiles Mediterranean Style', category: 'Roofing', type: 'Finished Product', unit: 'piece', warrantyPeriod: '120 months' },
      { materialId: 'MAT-SAND-001', materialName: 'River Sand Fine Grade', category: 'Construction', type: 'Raw Material', unit: 'm3', warrantyPeriod: null },
      { materialId: 'MAT-GRAVEL-001', materialName: 'Crushed Stone Gravel 20mm', category: 'Construction', type: 'Raw Material', unit: 'm3', warrantyPeriod: null },
      { materialId: 'MAT-GRANITE-001', materialName: 'Polished Granite Countertop', category: 'Finishing', type: 'Finished Product', unit: 'm2', warrantyPeriod: '60 months' }
    ]);
    console.log(`✅ Created ${materials.length} materials`);

    // ==================== STEP 2: Suppliers ====================
    console.log('\n🏢 Creating Suppliers...');
    const suppliers = await Supplier.insertMany([
      {
        companyName: 'BuildMaster Supply Co.',
        contactName: 'John Anderson',
        email: 'john@buildmaster.com',
        phone: '+1-555-0101',
        materials: [
          { name: 'Portland Cement Type I', pricePerUnit: 12.50 },
          { name: 'River Sand Fine Grade', pricePerUnit: 25.00 },
          { name: 'Crushed Stone Gravel 20mm', pricePerUnit: 30.00 }
        ],
        materialTypes: ['Cement', 'Sand', 'Gravel'],
        deliveryRegions: ['North District', 'East District'],
        rating: 4.5
      },
      {
        companyName: 'Steel Dynamics Ltd.',
        contactName: 'Maria Chen',
        email: 'maria@steeldynamics.com',
        phone: '+1-555-0202',
        materials: [
          { name: 'Steel Reinforcement Bar 12mm', pricePerUnit: 850.00 }
        ],
        materialTypes: ['Steel', 'Reinforcement'],
        deliveryRegions: ['North District', 'South District', 'Central District'],
        rating: 4.8
      },
      {
        companyName: 'Premium Tiles & Flooring',
        contactName: 'David Martinez',
        email: 'david@premiumtiles.com',
        phone: '+1-555-0303',
        materials: [
          { name: 'Ceramic Floor Tiles 60x60cm', pricePerUnit: 45.00 },
          { name: 'Polished Granite Countertop', pricePerUnit: 120.00 }
        ],
        materialTypes: ['Tiles', 'Granite', 'Flooring'],
        deliveryRegions: ['East District', 'West District'],
        rating: 4.3
      },
      {
        companyName: 'ColorWorks Paint Solutions',
        contactName: 'Sarah Johnson',
        email: 'sarah@colorworks.com',
        phone: '+1-555-0404',
        materials: [
          { name: 'Exterior Acrylic Paint White', pricePerUnit: 35.00 }
        ],
        materialTypes: ['Paint', 'Coatings'],
        deliveryRegions: ['All Districts'],
        rating: 4.6
      },
      {
        companyName: 'TimberCraft Lumber Yard',
        contactName: 'Robert Lee',
        email: 'robert@timbercraft.com',
        phone: '+1-555-0505',
        materials: [
          { name: 'Teak Wood Planks Grade A', pricePerUnit: 1200.00 },
          { name: 'Solid Oak Interior Door', pricePerUnit: 350.00 }
        ],
        materialTypes: ['Wood', 'Timber', 'Doors'],
        deliveryRegions: ['Central District', 'North District'],
        rating: 4.7
      },
      {
        companyName: 'ClearView Glass & Windows',
        contactName: 'Emily Wong',
        email: 'emily@clearview.com',
        phone: '+1-555-0606',
        materials: [
          { name: 'Tempered Glass 8mm', pricePerUnit: 65.00 },
          { name: 'Aluminum Window Frame with Glass', pricePerUnit: 280.00 }
        ],
        materialTypes: ['Glass', 'Windows'],
        deliveryRegions: ['East District', 'South District'],
        rating: 4.4
      },
      {
        companyName: 'CoolAir HVAC Systems',
        contactName: 'Michael Brown',
        email: 'michael@coolair.com',
        phone: '+1-555-0707',
        materials: [
          { name: 'Central AC Unit 5-Ton', pricePerUnit: 3500.00 }
        ],
        materialTypes: ['HVAC', 'Air Conditioning'],
        deliveryRegions: ['All Districts'],
        rating: 4.9
      },
      {
        companyName: 'PowerLine Electrical Supply',
        contactName: 'Lisa Taylor',
        email: 'lisa@powerline.com',
        phone: '+1-555-0808',
        materials: [
          { name: 'Electrical Cable 2.5mm Copper', pricePerUnit: 2.50 }
        ],
        materialTypes: ['Electrical', 'Wiring'],
        deliveryRegions: ['North District', 'Central District', 'West District'],
        rating: 4.2
      },
      {
        companyName: 'AquaFlow Plumbing Supplies',
        contactName: 'James Wilson',
        email: 'james@aquaflow.com',
        phone: '+1-555-0909',
        materials: [
          { name: 'PVC Pipe 4-inch Schedule 40', pricePerUnit: 8.00 }
        ],
        materialTypes: ['Plumbing', 'Pipes'],
        deliveryRegions: ['South District', 'East District'],
        rating: 4.1
      },
      {
        companyName: 'Mediterranean Roofing Inc.',
        contactName: 'Antonio Garcia',
        email: 'antonio@medroofing.com',
        phone: '+1-555-1010',
        materials: [
          { name: 'Clay Roof Tiles Mediterranean Style', pricePerUnit: 8.50 }
        ],
        materialTypes: ['Roofing', 'Tiles'],
        deliveryRegions: ['All Districts'],
        rating: 4.6
      }
    ]);
    console.log(`✅ Created ${suppliers.length} suppliers`);

    // ==================== STEP 3: Inspection Requests ====================
    console.log('\n🔍 Creating Inspection Requests...');
    const inspectionRequests = [];
    const propertyTypes = ['residential', 'commercial', 'apartment'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    const statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'in-progress', 'assigned', 'pending'];

    for (let i = 0; i < 12; i++) {
      const client = clients[i % clients.length];
      const propertyType = propertyTypes[i % propertyTypes.length];
      const status = statuses[i % statuses.length];
      
      inspectionRequests.push({
        client_ID: client._id,
        client_name: client.username,
        email: client.email,
        phone_number: client.phone || `+1-555-${String(1000 + i).padStart(4, '0')}`,
        propertyLocation_address: `${100 + i * 10} Main Street, Building ${i + 1}`,
        propertyLocation_city: cities[i % cities.length],
        propertyType: propertyType,
        number_of_floor: propertyType === 'apartment' ? randomInt(1, 3) : randomInt(1, 4),
        number_of_room: randomInt(2, 8),
        room_name: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom'].slice(0, randomInt(2, 4)),
        inspection_date: status === 'completed' ? new Date(Date.now() - randomInt(10, 60) * 24 * 60 * 60 * 1000) : 
                         status === 'pending' ? null : new Date(Date.now() + randomInt(1, 7) * 24 * 60 * 60 * 1000),
        status: status
      });
    }
    const createdInspections = await InspectionRequest.insertMany(inspectionRequests);
    console.log(`✅ Created ${createdInspections.length} inspection requests`);

    // ==================== STEP 4: Inspection Estimates ====================
    console.log('\n💰 Creating Inspection Estimates...');
    const inspectionEstimates = [];
    
    for (let i = 0; i < createdInspections.length; i++) {
      const inspection = createdInspections[i];
      if (inspection.status === 'completed' || inspection.status === 'in-progress' || inspection.status === 'assigned') {
        inspectionEstimates.push({
          inspectionRequestId: inspection._id,
          distanceKm: randomInt(5, 150),
          estimatedCost: randomFloat(150, 800),
          createdBy: financeManager._id
        });
      }
    }
    const createdInspectionEstimates = await InspectionEstimate.insertMany(inspectionEstimates);
    console.log(`✅ Created ${createdInspectionEstimates.length} inspection estimates`);

    // ==================== STEP 5: Projects ====================
    console.log('\n🏗️  Creating Projects...');
    const projects = [];
    const projectStatuses = ['Active', 'In Progress', 'In Progress', 'In Progress', 'Completed', 'Completed', 'On Hold', 'Active', 'In Progress', 'Completed'];
    const projectNames = [
      'Luxury Villa Construction - Oceanside',
      'Downtown Office Complex Renovation',
      'Green Valley Apartment Complex',
      'Riverside Shopping Mall Expansion',
      'Heritage Building Restoration',
      'Smart Home Automation Project',
      'Industrial Warehouse Construction',
      'Boutique Hotel Development',
      'Medical Clinic Interior Fit-Out',
      'Eco-Friendly School Building'
    ];

    for (let i = 0; i < 10; i++) {
      const inspection = createdInspections[i];
      const client = clients[i % clients.length];
      const pm = projectManagers[i % projectManagers.length] || client;
      const status = projectStatuses[i];
      const startDate = new Date(Date.now() - randomInt(30, 180) * 24 * 60 * 60 * 1000);
      
      projects.push({
        projectName: projectNames[i],
        inspectionId: inspection._id,
        projectManagerId: pm._id,
        clientId: client._id,
        status: status,
        progress: status === 'Completed' ? 100 : status === 'In Progress' ? randomInt(30, 85) : status === 'Active' ? randomInt(5, 25) : 0,
        startDate: startDate,
        dueDate: new Date(startDate.getTime() + randomInt(90, 365) * 24 * 60 * 60 * 1000),
        estimateCreated: i < 8, // First 8 have estimates
        archived: false
      });
    }
    const createdProjects = await Project.insertMany(projects);
    console.log(`✅ Created ${createdProjects.length} projects`);

    // ==================== STEP 6: Project Estimations ====================
    console.log('\n📊 Creating Project Estimations...');
    const projectEstimations = [];
    
    for (let i = 0; i < 8; i++) {
      const project = createdProjects[i];
      const laborCost = randomFloat(10000, 50000);
      const materialCost = randomFloat(15000, 80000);
      const serviceCost = randomFloat(5000, 25000);
      const contingencyCost = randomFloat(2000, 10000);
      
      // Version 1
      projectEstimations.push({
        projectId: project._id,
        version: 1,
        laborCost: laborCost,
        materialCost: materialCost,
        serviceCost: serviceCost,
        contingencyCost: contingencyCost,
        total: laborCost + materialCost + serviceCost + contingencyCost,
        createdBy: financeManager._id,
        status: i < 6 ? 'Approved' : 'Pending',
        quotationCreated: i < 6
      });
      
      // Some projects have version 2 (revised estimates)
      if (i < 4) {
        const laborCost2 = laborCost * randomFloat(0.9, 1.15);
        const materialCost2 = materialCost * randomFloat(0.85, 1.2);
        const serviceCost2 = serviceCost * randomFloat(0.95, 1.1);
        const contingencyCost2 = contingencyCost * randomFloat(0.9, 1.1);
        
        projectEstimations.push({
          projectId: project._id,
          version: 2,
          laborCost: laborCost2,
          materialCost: materialCost2,
          serviceCost: serviceCost2,
          contingencyCost: contingencyCost2,
          total: laborCost2 + materialCost2 + serviceCost2 + contingencyCost2,
          createdBy: financeManager._id,
          status: 'Approved',
          quotationCreated: true
        });
      }
    }
    const createdEstimations = await ProjectEstimation.insertMany(projectEstimations);
    console.log(`✅ Created ${createdEstimations.length} project estimations`);

    // ==================== STEP 7: Quotations ====================
    console.log('\n📄 Creating Quotations...');
    const quotations = [];
    
    // Create quotations for approved estimates
    const approvedEstimates = createdEstimations.filter(e => e.quotationCreated);
    
    for (let est of approvedEstimates) {
      const project = createdProjects.find(p => p._id.equals(est.projectId));
      
      // Generate labor items
      const laborItems = [
        { task: 'Site Preparation & Excavation', hours: randomInt(40, 80), rate: 25, total: 0 },
        { task: 'Foundation & Concrete Work', hours: randomInt(60, 120), rate: 30, total: 0 },
        { task: 'Structural Framing', hours: randomInt(80, 150), rate: 35, total: 0 },
        { task: 'Electrical Installation', hours: randomInt(40, 80), rate: 40, total: 0 },
        { task: 'Plumbing Installation', hours: randomInt(30, 60), rate: 38, total: 0 },
        { task: 'HVAC Installation', hours: randomInt(30, 50), rate: 42, total: 0 },
        { task: 'Interior Finishing', hours: randomInt(50, 100), rate: 28, total: 0 },
        { task: 'Painting & Coating', hours: randomInt(30, 70), rate: 22, total: 0 }
      ].slice(0, randomInt(4, 8)).map(item => {
        item.total = item.hours * item.rate;
        return item;
      });

      // Generate material items
      const selectedMaterials = materials.sort(() => 0.5 - Math.random()).slice(0, randomInt(5, 10));
      const materialItems = selectedMaterials.map(mat => ({
        materialId: mat._id,
        description: mat.materialName,
        quantity: randomInt(10, 500),
        unitPrice: randomFloat(10, 500),
        total: 0
      })).map(item => {
        item.total = item.quantity * item.unitPrice;
        return item;
      });

      // Generate service items
      const serviceItems = [
        { service: 'Architectural Design Services', cost: randomFloat(2000, 8000) },
        { service: 'Engineering Consultation', cost: randomFloat(1500, 5000) },
        { service: 'Project Management', cost: randomFloat(3000, 10000) },
        { service: 'Quality Inspection & Testing', cost: randomFloat(1000, 3000) },
        { service: 'Safety & Compliance', cost: randomFloat(800, 2500) }
      ].slice(0, randomInt(2, 5));

      // Generate contingency items
      const contingencyItems = [
        { description: 'Weather Delays Buffer', amount: randomFloat(500, 2000) },
        { description: 'Material Price Fluctuation', amount: randomFloat(1000, 3000) },
        { description: 'Unforeseen Site Conditions', amount: randomFloat(800, 2500) }
      ].slice(0, randomInt(1, 3));

      const subtotal = laborItems.reduce((sum, i) => sum + i.total, 0) +
                      materialItems.reduce((sum, i) => sum + i.total, 0) +
                      serviceItems.reduce((sum, i) => sum + i.cost, 0);
      
      const totalContingency = contingencyItems.reduce((sum, i) => sum + i.amount, 0);
      const taxRate = 0.15; // 15% VAT
      const totalTax = (subtotal + totalContingency) * taxRate;
      const grandTotal = subtotal + totalContingency + totalTax;

      quotations.push({
        projectId: est.projectId,
        estimateVersion: est.version,
        version: 1,
        status: randomItem(['Sent', 'Confirmed', 'Locked']),
        locked: randomItem([true, false]),
        remarks: randomItem([
          'Quotation includes all materials and labor as specified',
          'Subject to site inspection and final measurements',
          'Prices valid for 30 days from quotation date',
          'Payment terms: 30% advance, 40% on progress, 30% on completion'
        ]),
        createdBy: financeManager._id,
        sentTo: project.clientId,
        sentAt: new Date(Date.now() - randomInt(5, 45) * 24 * 60 * 60 * 1000),
        laborItems: laborItems,
        materialItems: materialItems,
        serviceItems: serviceItems,
        contingencyItems: contingencyItems,
        taxes: [{
          description: 'VAT 15%',
          percentage: 15,
          amount: totalTax
        }],
        subtotal: subtotal,
        totalContingency: totalContingency,
        totalTax: totalTax,
        grandTotal: grandTotal
      });
    }
    const createdQuotations = await QuotationEstimation.insertMany(quotations);
    console.log(`✅ Created ${createdQuotations.length} quotations`);

    // ==================== STEP 8: Payments ====================
    console.log('\n💳 Creating Payments...');
    const payments = [];
    const paymentMethods = ['Bank', 'Online', 'Cash'];
    const paymentTypes = ['InspectionCost', 'ProjectPayment', 'Advance'];
    const paymentStatuses = ['Approved', 'Approved', 'Approved', 'Approved', 'Pending', 'Pending', 'Rejected'];

    for (let i = 0; i < 15; i++) {
      const project = createdProjects[i % createdProjects.length];
      const client = clients.find(c => c._id.equals(project.clientId));
      const type = paymentTypes[i % paymentTypes.length];
      const status = paymentStatuses[i % paymentStatuses.length];
      
      let amount;
      if (type === 'InspectionCost') {
        amount = randomFloat(150, 800);
      } else if (type === 'Advance') {
        amount = randomFloat(5000, 25000);
      } else {
        amount = randomFloat(10000, 50000);
      }

      payments.push({
        projectId: project._id,
        clientId: client._id,
        amount: amount,
        method: paymentMethods[i % paymentMethods.length],
        type: type,
        receiptUrl: `/uploads/receipt-${Date.now()}-${i}.pdf`,
        status: status,
        comment: status === 'Rejected' ? 'Invalid receipt format' : status === 'Pending' ? 'Under review' : 'Verified and approved',
        verifiedBy: status === 'Approved' ? financeManager._id : null
      });
    }
    const createdPayments = await Payment.insertMany(payments);
    console.log(`✅ Created ${createdPayments.length} payments`);

    // ==================== STEP 9: Expenses ====================
    console.log('\n💸 Creating Expenses...');
    const expenses = [];
    const expenseCategories = ['Labor', 'Procurement', 'Transport', 'Misc'];
    const expenseDescriptions = {
      'Labor': ['Weekly labor wages - Site workers', 'Overtime payment for deadline', 'Skilled craftsman hiring', 'Supervisor monthly salary'],
      'Procurement': ['Material purchase from supplier', 'Equipment rental', 'Tool purchase and maintenance', 'Safety equipment procurement'],
      'Transport': ['Material delivery charges', 'Equipment transportation', 'Site visit fuel costs', 'Waste disposal transportation'],
      'Misc': ['Site office utilities', 'Communication expenses', 'Documentation and permits', 'Client entertainment']
    };

    for (let i = 0; i < 20; i++) {
      const project = createdProjects[i % createdProjects.length];
      const category = expenseCategories[i % expenseCategories.length];
      const descriptions = expenseDescriptions[category];
      
      expenses.push({
        projectId: project._id,
        category: category,
        amount: category === 'Labor' ? randomFloat(2000, 8000) :
                category === 'Procurement' ? randomFloat(1000, 15000) :
                category === 'Transport' ? randomFloat(100, 2000) :
                randomFloat(50, 1500),
        description: descriptions[randomInt(0, descriptions.length - 1)],
        createdBy: projectManagers[i % projectManagers.length]._id,
        proof: randomItem([null, null, `/uploads/expense-proof-${i}.pdf`])
      });
    }
    const createdExpenses = await Expense.insertMany(expenses);
    console.log(`✅ Created ${createdExpenses.length} expenses`);

    // ==================== STEP 10: Purchase Orders ====================
    console.log('\n📦 Creating Purchase Orders...');
    const purchaseOrders = [];
    const poStatuses = ['Approved', 'Approved', 'SentToSupplier', 'InProgress', 'Delivered', 'PendingFinanceApproval', 'Approved', 'Closed', 'Delivered', 'Approved'];
    const requestOrigins = ['ProjectMR', 'Manual', 'ReorderAlert'];

    for (let i = 0; i < 12; i++) {
      const project = createdProjects[i % createdProjects.length];
      const supplier = suppliers[i % suppliers.length];
      const status = poStatuses[i % poStatuses.length];
      const origin = requestOrigins[i % requestOrigins.length];
      
      // Select 2-5 materials for this PO
      const selectedMaterials = materials.sort(() => 0.5 - Math.random()).slice(0, randomInt(2, 5));
      const items = selectedMaterials.map(mat => ({
        materialId: mat._id,
        materialName: mat.materialName,
        qty: randomInt(10, 200),
        unitPrice: randomFloat(10, 500)
      }));
      
      const totalAmount = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);

      const financeApproval = {
        status: status === 'PendingFinanceApproval' ? 'Pending' : 
                status === 'Rejected' ? 'Rejected' : 'Approved',
        approverId: (status !== 'PendingFinanceApproval' && status !== 'Draft') ? financeManager._id : null,
        note: status === 'Rejected' ? 'Budget exceeded for this quarter' : 
              status === 'PendingFinanceApproval' ? 'Awaiting review' : 'Approved for procurement',
        approvedAt: (status !== 'PendingFinanceApproval' && status !== 'Draft') ? 
                    new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000) : null
      };

      purchaseOrders.push({
        requestOrigin: origin,
        projectId: project._id,
        supplierId: supplier._id,
        requestedBy: procurementOfficer._id,
        status: status,
        items: items,
        totalAmount: totalAmount,
        financeApproval: financeApproval
      });
    }
    const createdPOs = await PurchaseOrder.insertMany(purchaseOrders);
    console.log(`✅ Created ${createdPOs.length} purchase orders`);

    // ==================== STEP 11: Warranties ====================
    console.log('\n🛡️  Creating Warranties...');
    const warranties = [];
    const warrantyStatuses = ['Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Expired', 'Claimed', 'Active', 'Replaced'];
    
    // Only create warranties for materials with warranty periods
    const warrantyMaterials = materials.filter(m => m.warrantyPeriod);
    
    for (let i = 0; i < 10; i++) {
      const project = createdProjects[i % createdProjects.length];
      const client = clients.find(c => c._id.equals(project.clientId));
      const material = warrantyMaterials[i % warrantyMaterials.length];
      const status = warrantyStatuses[i];
      
      const warrantyMonths = parseInt(material.warrantyPeriod) || 12;
      const startDate = new Date(Date.now() - randomInt(0, warrantyMonths * 20) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + warrantyMonths * 30 * 24 * 60 * 60 * 1000);
      
      warranties.push({
        projectId: project._id,
        clientId: client._id,
        itemId: material._id,
        warrantyStart: startDate,
        warrantyEnd: endDate,
        status: status
      });
    }
    const createdWarranties = await Warranty.insertMany(warranties);
    console.log(`✅ Created ${createdWarranties.length} warranties`);

    // ==================== STEP 12: Warranty Claims ====================
    console.log('\n📋 Creating Warranty Claims...');
    const warrantyClaims = [];
    const claimStatuses = ['Submitted', 'UnderReview', 'Approved', 'Rejected', 'Replaced'];
    const issueDescriptions = [
      'Material shows signs of premature wear and deterioration',
      'Product failed to meet specifications outlined in warranty',
      'Defect discovered during routine inspection',
      'Component malfunction affecting overall system performance',
      'Quality issue reported by client within warranty period',
      'Installation defect leading to material failure',
      'Manufacturing defect identified after installation',
      'Performance degradation beyond acceptable limits'
    ];

    // Create claims for some warranties (not all)
    const claimableWarranties = createdWarranties.filter(w => ['Claimed', 'Replaced'].includes(w.status));
    
    for (let i = 0; i < claimableWarranties.length; i++) {
      const warranty = claimableWarranties[i];
      const client = clients.find(c => c._id.equals(warranty.clientId));
      const status = claimStatuses[i % claimStatuses.length];
      
      warrantyClaims.push({
        warrantyId: warranty._id,
        clientId: client._id,
        issueDescription: issueDescriptions[i % issueDescriptions.length],
        status: status,
        financeReviewerId: ['Approved', 'Rejected', 'Replaced'].includes(status) ? financeManager._id : null,
        warehouseAction: {
          shippedReplacement: status === 'Replaced',
          shippedAt: status === 'Replaced' ? new Date(Date.now() - randomInt(1, 10) * 24 * 60 * 60 * 1000) : null
        }
      });
    }
    
    // Add a few more pending claims
    const activeWarranties = createdWarranties.filter(w => w.status === 'Active').slice(0, 3);
    for (let warranty of activeWarranties) {
      const client = clients.find(c => c._id.equals(warranty.clientId));
      warrantyClaims.push({
        warrantyId: warranty._id,
        clientId: client._id,
        issueDescription: issueDescriptions[randomInt(0, issueDescriptions.length - 1)],
        status: 'Submitted',
        financeReviewerId: null,
        warehouseAction: {
          shippedReplacement: false,
          shippedAt: null
        }
      });
    }
    
    const createdClaims = await WarrantyClaim.insertMany(warrantyClaims);
    console.log(`✅ Created ${createdClaims.length} warranty claims`);

    // ==================== STEP 13: Notifications ====================
    console.log('\n🔔 Creating Notifications...');
    const notifications = [];
    const notificationMessages = [
      { type: 'payment', msg: 'New payment received and pending approval' },
      { type: 'payment', msg: 'Payment approved successfully' },
      { type: 'estimate', msg: 'New project estimation created for review' },
      { type: 'quotation', msg: 'Quotation sent to client' },
      { type: 'quotation', msg: 'Client confirmed quotation' },
      { type: 'purchase_order', msg: 'Purchase order requires finance approval' },
      { type: 'purchase_order', msg: 'Purchase order approved' },
      { type: 'warranty', msg: 'New warranty claim submitted' },
      { type: 'warranty', msg: 'Warranty claim approved for replacement' },
      { type: 'expense', msg: 'New expense recorded for project' },
      { type: 'inspection', msg: 'Inspection estimate created' },
      { type: 'project', msg: 'Project status updated' }
    ];

    // Create notifications for finance managers
    for (let i = 0; i < 15; i++) {
      const fm = financeManagers[i % financeManagers.length] || financeManager;
      const notif = notificationMessages[i % notificationMessages.length];
      
      notifications.push({
        userId: fm._id,
        message: notif.msg,
        type: notif.type,
        read: randomItem([true, false, false]), // Most unread
        createdAt: new Date(Date.now() - randomInt(0, 10) * 24 * 60 * 60 * 1000)
      });
    }

    // Create some notifications for clients
    for (let i = 0; i < 5; i++) {
      const client = clients[i % clients.length];
      notifications.push({
        userId: client._id,
        message: randomItem([
          'Your quotation is ready for review',
          'Payment has been processed',
          'Your warranty claim is under review',
          'Project milestone achieved'
        ]),
        type: randomItem(['quotation', 'payment', 'warranty', 'project']),
        read: randomItem([true, false]),
        createdAt: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000)
      });
    }

    const createdNotifications = await Notification.insertMany(notifications);
    console.log(`✅ Created ${createdNotifications.length} notifications`);

    // ==================== Summary ====================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📦 Materials:              ${materials.length}`);
    console.log(`🏢 Suppliers:              ${suppliers.length}`);
    console.log(`🔍 Inspection Requests:    ${createdInspections.length}`);
    console.log(`💰 Inspection Estimates:   ${createdInspectionEstimates.length}`);
    console.log(`🏗️  Projects:               ${createdProjects.length}`);
    console.log(`📊 Project Estimations:    ${createdEstimations.length}`);
    console.log(`📄 Quotations:             ${createdQuotations.length}`);
    console.log(`💳 Payments:               ${createdPayments.length}`);
    console.log(`💸 Expenses:               ${createdExpenses.length}`);
    console.log(`📦 Purchase Orders:        ${createdPOs.length}`);
    console.log(`🛡️  Warranties:             ${createdWarranties.length}`);
    console.log(`📋 Warranty Claims:        ${createdClaims.length}`);
    console.log(`🔔 Notifications:          ${createdNotifications.length}`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedFinanceData();
