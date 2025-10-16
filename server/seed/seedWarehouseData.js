import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import warehouse manager models
import rawMaterialsModel from '../modules/warehouse-manager/model/rawMaterialsModel.js';
import manuProductsModel from '../modules/warehouse-manager/model/manuProductsModel.js';
import invLocationsModel from '../modules/warehouse-manager/model/invLocationsModel.js';
import stockMovementModel from '../modules/warehouse-manager/model/stockMovementModel.js';
import thresholdAlertModel from '../modules/warehouse-manager/model/thresholdAlertModel.js';

// Import some core models for relationships
import User from '../modules/auth/model/user.model.js';
import Material from '../modules/supplier/model/material.model.js';

const mongoURI = process.env.MONGO_URI;

async function seedWarehouseData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get existing users and materials for relationships
    const warehouseManagers = await User.find({ role: 'warehouse manager' });
    const materials = await Material.find({});
    
    if (warehouseManagers.length === 0 || materials.length === 0) {
      console.log('⚠️ Please run seedComprehensiveData.js first to create users and materials');
      return;
    }

    console.log('🗑️ Clearing existing warehouse data...');
    await Promise.all([
      rawMaterialsModel.deleteMany({}),
      manuProductsModel.deleteMany({}),
      invLocationsModel.deleteMany({}),
      stockMovementModel.deleteMany({}),
      thresholdAlertModel.deleteMany({})
    ]);

    // 1. Create Inventory Locations
    console.log('\\n📍 Creating inventory locations...');
    const locationData = [
      {
        inventoryName: 'Main Warehouse - Colombo',
        inventoryAddress: '123 Industrial Zone, Colombo 15',
        country: 'Sri Lanka',
        capacity: 5000,
        inventoryContact: '+94112345678',
        warehouseManagerName: 'Gayan Warehouse Manager'
      },
      {
        inventoryName: 'Storage Unit - Kandy',
        inventoryAddress: '45 Peradeniya Road, Kandy',
        country: 'Sri Lanka',
        capacity: 2000,
        inventoryContact: '+94812345678',
        warehouseManagerName: 'Gayan Warehouse Manager'
      },
      {
        inventoryName: 'Distribution Center - Galle',
        inventoryAddress: '78 Galle Road, Galle',
        country: 'Sri Lanka',
        capacity: 3000,
        inventoryContact: '+94912345678',
        warehouseManagerName: 'Gayan Warehouse Manager'
      }
    ];
    const locations = await invLocationsModel.insertMany(locationData);
    console.log(`✅ Created ${locations.length} inventory locations`);

    // 2. Create Raw Materials
    console.log('\\n🏗️ Creating raw materials...');
    const rawMaterialsData = [
      {
        materialName: 'Portland Cement',
        category: 'Concrete',
        type: 'Cement',
        unit: 'kg',
        restockLevel: 5000,
        reorderLevel: 500,
        currentLevel: 2500,
        inventoryName: locations[0].inventoryName,
        createdBy: warehouseManagers[0].username
      },
      {
        materialName: 'Steel Reinforcement Bars',
        category: 'Structural',
        type: 'Steel',
        unit: 'kg',
        restockLevel: 2000,
        reorderLevel: 200,
        currentLevel: 1200,
        inventoryName: locations[0].inventoryName,
        createdBy: warehouseManagers[0].username
      },
      {
        materialName: 'River Sand',
        category: 'Aggregate',
        type: 'Sand',
        unit: 'cubic meter',
        restockLevel: 1000,
        reorderLevel: 100,
        currentLevel: 800,
        inventoryName: locations[1].inventoryName,
        createdBy: warehouseManagers[0].username
      },
      {
        materialName: 'Timber - Teak',
        category: 'Wood',
        type: 'Timber',
        unit: 'cubic foot',
        restockLevel: 300,
        reorderLevel: 30,
        currentLevel: 150,
        inventoryName: locations[2].inventoryName,
        createdBy: warehouseManagers[0].username
      },
      {
        materialName: 'Granite Chips',
        category: 'Aggregate',
        type: 'Stone',
        unit: 'cubic meter',
        restockLevel: 800,
        reorderLevel: 80,
        currentLevel: 450,
        inventoryName: locations[0].inventoryName,
        createdBy: warehouseManagers[0].username
      }
    ];
    const rawMaterials = await rawMaterialsModel.insertMany(rawMaterialsData);
    console.log(`✅ Created ${rawMaterials.length} raw materials`);

    // 3. Create Manufactured Products
    console.log('\\n🏭 Creating manufactured products...');
    const manuProductsData = [
      {
        materialName: 'Precast Concrete Slabs',
        category: 'Structural Component',
        type: 'Precast',
        unit: 'piece',
        restockLevel: 150,
        reorderLevel: 20,
        currentLevel: 85,
        warrantyPeriod: '5 years',
        inventoryName: locations[0].inventoryName,
        createdBy: warehouseManagers[0].username
      },
      {
        materialName: 'Window Frame Assembly',
        category: 'Finished Product',
        type: 'Window',
        unit: 'set',
        restockLevel: 80,
        reorderLevel: 10,
        currentLevel: 45,
        warrantyPeriod: '10 years',
        inventoryName: locations[1].inventoryName,
        createdBy: warehouseManagers[0].username
      },
      {
        materialName: 'Custom Door Units',
        category: 'Finished Product',
        type: 'Door',
        unit: 'piece',
        restockLevel: 50,
        reorderLevel: 8,
        currentLevel: 28,
        warrantyPeriod: '15 years',
        inventoryName: locations[2].inventoryName,
        createdBy: warehouseManagers[0].username
      },
      {
        materialName: 'Roof Tile Set',
        category: 'Roofing',
        type: 'Tiles',
        unit: 'set',
        restockLevel: 200,
        reorderLevel: 25,
        currentLevel: 120,
        warrantyPeriod: '20 years',
        inventoryName: locations[0].inventoryName,
        createdBy: warehouseManagers[0].username
      }
    ];
    const manuProducts = await manuProductsModel.insertMany(manuProductsData);
    console.log(`✅ Created ${manuProducts.length} manufactured products`);

    // 4. Create simplified stock movements (if the model supports basic fields)
    console.log('\\n📦 Creating stock movements...');
    try {
      // Simple stock movement data
      const basicMovements = [
        {
          movementType: 'Inbound',
          quantity: 500,
          reason: 'Purchase Order Received',
          status: 'Completed'
        },
        {
          movementType: 'Outbound', 
          quantity: 200,
          reason: 'Project Allocation',
          status: 'Completed'
        }
      ];
      
      const createdMovements = await stockMovementModel.insertMany(basicMovements);
      console.log(`✅ Created ${createdMovements.length} stock movements`);
    } catch (error) {
      console.log('⚠️ Stock movements skipped due to model requirements');
    }

    // 5. Create simplified threshold alerts
    console.log('\\n⚠️ Creating threshold alerts...');
    try {
      const basicAlerts = [
        {
          alertType: 'Low Stock',
          priority: 'High',
          status: 'Active',
          message: 'Portland Cement stock is below reorder level'
        },
        {
          alertType: 'Low Stock',
          priority: 'Medium', 
          status: 'Active',
          message: 'Timber stock is running low'
        }
      ];
      
      const createdAlerts = await thresholdAlertModel.insertMany(basicAlerts);
      console.log(`✅ Created ${createdAlerts.length} threshold alerts`);
    } catch (error) {
      console.log('⚠️ Threshold alerts skipped due to model requirements');
    }

    // Summary
    console.log('\\n📊 WAREHOUSE DATA SEEDING SUMMARY');
    console.log('=' + '='.repeat(45));
    console.log(`📍 Inventory Locations: ${locations.length}`);
    console.log(`🏗️ Raw Materials: ${rawMaterials.length}`);
    console.log(`🏭 Manufactured Products: ${manuProducts.length}`);
    console.log('=' + '='.repeat(45));

    await mongoose.disconnect();
    console.log('🔚 Database connection closed');
    console.log('✅ Warehouse data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding warehouse data:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedWarehouseData();
}

export default seedWarehouseData;