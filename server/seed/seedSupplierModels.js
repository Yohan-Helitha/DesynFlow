import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import User from '../modules/auth/model/user.model.js';
import Project from '../modules/project/model/project.model.js';
import Supplier from '../modules/supplier/model/supplier.model.js';
import Material from '../modules/supplier/model/material.model.js';
import PurchaseOrder from '../modules/supplier/model/purchaseOrder.model.js';
import SampleOrder from '../modules/supplier/model/sampleOrder.model.js';

const mongoURI = process.env.MONGO_URI;

async function seedSupplierModels() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get existing data for relationships
    console.log('📊 Fetching existing data for relationships...');
    const users = await User.find({});
    const projects = await Project.find({});
    const suppliers = await Supplier.find({});
    const materials = await Material.find({});
    
    const procurementOfficers = users.filter(u => u.role === 'procurement officer');
    const projectManagers = users.filter(u => u.role === 'project manager');
    const financeManagers = users.filter(u => u.role === 'finance manager');

    if (suppliers.length === 0 || materials.length === 0 || users.length === 0) {
      console.log('❌ No existing suppliers, materials, or users found. Please run seedComprehensiveData.js first');
      process.exit(1);
    }

    console.log(`Found ${users.length} users, ${projects.length} projects, ${suppliers.length} suppliers, ${materials.length} materials`);

    // Clear existing supplier data
    console.log('🗑️ Clearing existing supplier data...');
    await Promise.all([
      PurchaseOrder.deleteMany({}),
      SampleOrder.deleteMany({})
    ]);
    console.log('✅ Cleared existing supplier data');

    // 1. Create Purchase Orders
    console.log('\\n📦 Creating purchase orders...');
    const purchaseOrderData = [];
    
    // Create 15-20 purchase orders
    for (let i = 0; i < 18; i++) {
      const supplier = suppliers[i % suppliers.length];
      const project = projects[i % projects.length];
      const requestedBy = procurementOfficers.length > 0 ? procurementOfficers[i % procurementOfficers.length] : projectManagers[0];
      const financeApprover = financeManagers[i % financeManagers.length];
      
      // Create 2-4 items per purchase order
      const numItems = Math.floor(Math.random() * 3) + 2;
      const items = [];
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        const material = materials[j % materials.length];
        const quantity = Math.floor(Math.random() * 100) + 10;
        const unitPrice = Math.floor(Math.random() * 5000) + 500; // LKR 500-5500
        const itemTotal = quantity * unitPrice;
        
        items.push({
          materialId: material._id,
          materialName: material.materialName,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: itemTotal,
          specifications: `High quality ${material.materialName} as per project requirements`,
          urgency: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        });
        
        totalAmount += itemTotal;
      }
      
      const statuses = ['Draft', 'PendingFinanceApproval', 'Approved', 'Rejected', 'SentToSupplier', 'InProgress', 'Delivered', 'Closed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const origins = ['ReorderAlert', 'Manual', 'ProjectMR'];
      
      // Finance approval details
      const financeApproval = {
        approverId: financeApprover._id,
        status: status === 'Rejected' ? 'Rejected' : 
                status === 'Draft' || status === 'PendingFinanceApproval' ? 'Pending' : 'Approved',
        note: status === 'Rejected' ? 'Budget constraints for this quarter' : 
              status === 'Approved' ? 'Approved for immediate procurement' : 'Under review',
        approvedAt: status === 'Approved' ? new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000) : null
      };
      
      purchaseOrderData.push({
        requestOrigin: origins[Math.floor(Math.random() * origins.length)],
        projectId: project._id,
        supplierId: supplier._id,
        requestedBy: requestedBy._id,
        status: status,
        items: items,
        totalAmount: totalAmount,
        financeApproval: financeApproval
      });
    }

    const purchaseOrders = await PurchaseOrder.insertMany(purchaseOrderData);
    console.log(`✅ Created ${purchaseOrders.length} purchase orders`);

    // 2. Create Sample Orders
    console.log('\\n🧪 Creating sample orders...');
    const sampleOrderData = [];
    
    // Create 12-15 sample orders
    for (let i = 0; i < 14; i++) {
      const supplier = suppliers[i % suppliers.length];
      const material = materials[i % materials.length];
      const requestedBy = procurementOfficers.length > 0 ? procurementOfficers[i % procurementOfficers.length] : projectManagers[0];
      
      const statuses = ['Requested', 'Submitted', 'Approved', 'Rejected'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const reviewNotes = {
        'Approved': [
          'Sample quality meets our standards. Approved for bulk procurement.',
          'Excellent material quality. Recommend for project use.',
          'Sample testing results are satisfactory. Green light for purchase.'
        ],
        'Rejected': [
          'Sample quality below expected standards.',
          'Material specifications do not match requirements.',
          'Better alternatives available from other suppliers.'
        ],
        'Submitted': [
          'Sample submitted for technical evaluation.',
          'Quality testing in progress.',
          'Under review by technical team.'
        ],
        'Requested': [
          'Sample requested from supplier.',
          'Awaiting sample delivery from supplier.',
          'Initial request sent to supplier.'
        ]
      };
      
      const files = status === 'Submitted' || status === 'Approved' ? 
        [`sample_${material.materialId}_${Date.now()}.pdf`, `test_report_${material.materialId}.pdf`] : [];
      
      sampleOrderData.push({
        supplierId: supplier._id,
        materialId: material._id,
        requestedBy: requestedBy._id,
        status: status,
        files: files,
        reviewNote: reviewNotes[status][Math.floor(Math.random() * reviewNotes[status].length)]
      });
    }

    const sampleOrders = await SampleOrder.insertMany(sampleOrderData);
    console.log(`✅ Created ${sampleOrders.length} sample orders`);

    // Summary
    console.log('\\n📊 SUPPLIER MODELS SEEDING SUMMARY');
    console.log('=' + '='.repeat(45));
    console.log(`📦 Purchase Orders: ${purchaseOrders.length}`);
    console.log(`🧪 Sample Orders: ${sampleOrders.length}`);
    
    console.log('\\n📦 Purchase Orders by Status:');
    const ordersByStatus = purchaseOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(ordersByStatus).forEach(([status, count]) => {
      console.log(`   • ${status}: ${count} orders`);
    });

    console.log('\\n📦 Purchase Orders by Origin:');
    const ordersByOrigin = purchaseOrders.reduce((acc, order) => {
      acc[order.requestOrigin] = (acc[order.requestOrigin] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(ordersByOrigin).forEach(([origin, count]) => {
      console.log(`   • ${origin}: ${count} orders`);
    });

    console.log('\\n🧪 Sample Orders by Status:');
    const samplesByStatus = sampleOrders.reduce((acc, sample) => {
      acc[sample.status] = (acc[sample.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(samplesByStatus).forEach(([status, count]) => {
      console.log(`   • ${status}: ${count} samples`);
    });

    console.log('\\n💰 Financial Summary:');
    const totalOrderValue = purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const approvedOrderValue = purchaseOrders
      .filter(order => order.financeApproval.status === 'Approved')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    console.log(`   • Total Order Value: LKR ${totalOrderValue.toLocaleString()}`);
    console.log(`   • Approved Order Value: LKR ${approvedOrderValue.toLocaleString()}`);
    console.log(`   • Average Order Value: LKR ${Math.round(totalOrderValue / purchaseOrders.length).toLocaleString()}`);

    console.log('=' + '='.repeat(45));

    await mongoose.disconnect();
    console.log('🔚 Database connection closed');
    console.log('✅ Supplier models seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding supplier models:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSupplierModels();
}

export default seedSupplierModels;