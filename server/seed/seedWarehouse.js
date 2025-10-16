import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load env
dotenv.config();

// Models
import User from '../modules/auth/model/user.model.js';
import InvLocation from '../modules/warehouse-manager/model/invLocationsModel.js';
import ManuProduct from '../modules/warehouse-manager/model/manuProductsModel.js';
import RawMaterial from '../modules/warehouse-manager/model/rawMaterialsModel.js';
import StockMovement from '../modules/warehouse-manager/model/stockMovementModel.js';
import TransferRequest from '../modules/warehouse-manager/model/transferRequestModel.js';
import DisposalMaterial from '../modules/warehouse-manager/model/disposalMaterialsModel.js';
import SReorderRequest from '../modules/warehouse-manager/model/sReorderRequestsModel.js';
import ThresholdAlert from '../modules/warehouse-manager/model/thresholdAlertModel.js';
import AuditLog from '../modules/warehouse-manager/model/auditLogModel.js';

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

const seedCollection = async (Model, docs, name) => {
  const count = await Model.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  ${name} already present (${count}). Skipping.`);
    return { skipped: true, inserted: 0 };
  }
                                                          
  try {
    await Model.create(docs);
    console.log(`  • ${name} seeded (${docs.length})`);
    return { skipped: false, inserted: docs.length };
  } catch (err) {
    if (err && err.code === 11000) {
      console.warn(`⚠️ Duplicate key when seeding ${name}:`, err.keyValue || err.message);
      return { skipped: false, inserted: 0 };
    }
    throw err;
  }
};

// Seed warehouse manager user
const seedWarehouseUser = async () => {
  try {
    // Check if warehouse manager already exists
    const existingUser = await User.findOne({ username: 'carol_warehouse' });
    if (existingUser) {
      console.log('ℹ️  Warehouse manager user already exists. Skipping.');
      return;
    }

    // Warehouse manager user data
    const warehouseUser = {
      username: 'carol_warehouse',
      email: 'carol.warehouse@desynflow.com',
      password: await bcrypt.hash('warehouse123', 8),
      phone: '+94708901234',
      role: 'warehouse manager',
      isVerified: true,
      isActive: true
    };

    // Create the user
    await User.create(warehouseUser);
    console.log('✅ Warehouse manager user seeded successfully');
    
  } catch (error) {
    console.error('❌ Error seeding warehouse user:', error);
    throw error;
  }
};

const seedWarehouse = async () => {
  try {
    // First, seed the warehouse manager user if not exists
    await seedWarehouseUser();

    // 1) Inventory Locations (3)
    const invs = [
      {
        inventoryName: 'Central Warehouse',
        inventoryAddress: '12 Industrial Ave, Colombo',
        country: 'Sri Lanka',
        capacity: 5000,
        inventoryContact: '+94770000001',
        warehouseManagerName: 'carol_warehouse'
      },
      {
        inventoryName: 'North Depot',
        inventoryAddress: '45 Northern Rd, Jaffna',
        country: 'Sri Lanka',
        capacity: 2500,
        inventoryContact: '+94770000002',
        warehouseManagerName: 'carol_warehouse'
      },
      {
        inventoryName: 'South Hub',
        inventoryAddress: '8 Southern Blvd, Galle',
        country: 'Sri Lanka',
        capacity: 3000,
        inventoryContact: '+94770000003',
        warehouseManagerName: 'carol_warehouse'
      }
    ];

    // 2) Manufactured Products (3)
    const manus = [
      {
        materialName: 'Wooden Table',
        category: 'Furniture',
        type: 'Finished',
        unit: 'pcs',
        restockLevel: 10,
        reorderLevel: 5,
        currentLevel: 20,
        warrantyPeriod: '2 years',
        inventoryName: 'Central Warehouse',
          createdBy: 'carol_warehouse',
          month: new Date().toLocaleString('en-US', { month: 'long' }),
          year: new Date().getFullYear()
      },
      {
        materialName: 'Office Chair',
        category: 'Furniture',
        type: 'Finished',
        unit: 'pcs',
        restockLevel: 15,
        reorderLevel: 8,
        currentLevel: 40,
        warrantyPeriod: '1 year',
        inventoryName: 'Central Warehouse',
          createdBy: 'carol_warehouse',
          month: new Date().toLocaleString('en-US', { month: 'long' }),
          year: new Date().getFullYear()
      },
      {
        materialName: 'Wardrobe',
        category: 'Storage',
        type: 'Finished',
        unit: 'pcs',
        restockLevel: 5,
        reorderLevel: 2,
        currentLevel: 7,
        warrantyPeriod: '3 years',
        inventoryName: 'South Hub',
          createdBy: 'carol_warehouse',
          month: new Date().toLocaleString('en-US', { month: 'long' }),
          year: new Date().getFullYear()
      }
    ];

    // 3) Raw Materials (3)
    const raws = [
      {
        materialName: 'Plywood Sheet',
        category: 'Wood',
        type: 'Sheet',
        unit: 'sheets',
        restockLevel: 100,
        reorderLevel: 50,
        currentLevel: 220,
        inventoryName: 'Central Warehouse',
          createdBy: 'carol_warehouse',
          month: new Date().toLocaleString('en-US', { month: 'long' }),
          year: new Date().getFullYear()
      },
      {
        materialName: 'Varnish',
        category: 'Chemical',
        type: 'Liquid',
        unit: 'litres',
        restockLevel: 50,
        reorderLevel: 20,
        currentLevel: 75,
        inventoryName: 'North Depot',
          createdBy: 'carol_warehouse',
          month: new Date().toLocaleString('en-US', { month: 'long' }),
          year: new Date().getFullYear()
      },
      {
        materialName: 'Screws (4mm)',
        category: 'Hardware',
        type: 'Fastener',
        unit: 'boxes',
        restockLevel: 30,
        reorderLevel: 10,
        currentLevel: 60,
        inventoryName: 'Central Warehouse',
        createdBy: 'carol_warehouse',
        month: new Date().toLocaleString('en-US', { month: 'long' }),
        year: new Date().getFullYear()
      }
    ];

    // 4) Stock Movements (3)
    const movements = [
      {
        materialId: 'MAT001',
        fromLocation: 'Central Warehouse',
        toLocation: 'South Hub',
        unit: 'pcs',
        quantity: 5,
        reason: 'Transfer to fulfill order',
        requestedBy: 'carol_warehouse',
        approvedBy: 'manager',
        employeeId: 'EMP001',
        vehicleInfo: 'Truck LK-1001',
        dispatchedDate: new Date()
      },
      {
        materialId: 'MAT002',
        fromLocation: 'Central Warehouse',
        toLocation: 'North Depot',
        unit: 'litres',
        quantity: 20,
        reason: 'Rebalance stock',
        requestedBy: 'carol_warehouse',
        approvedBy: 'manager',
        employeeId: 'EMP002',
        vehicleInfo: 'Van LK-2002',
        dispatchedDate: new Date()
      },
      {
        materialId: 'MAT003',
        fromLocation: 'North Depot',
        toLocation: 'Central Warehouse',
        unit: 'boxes',
        quantity: 10,
        reason: 'Return excess',
        requestedBy: 'carol_warehouse',
        approvedBy: 'manager',
        employeeId: 'EMP003',
        vehicleInfo: 'Truck LK-3003',
        dispatchedDate: new Date()
      }
    ];

    // 5) Transfer Requests (3)
    const transfers = [
      {
        materialId: 'MAT001',
        fromLocation: 'Central Warehouse',
        toLocation: 'South Hub',
        quantity: 5,
        reason: 'Customer order',
        requestedBy: 'carol_warehouse',
        approvedBy: null,
        requiredBy: new Date(Date.now() + 5 * 24 * 3600 * 1000) // 5 days
      },
      {
        materialId: 'MAT004',
        fromLocation: 'Central Warehouse',
        toLocation: 'North Depot',
        quantity: 12,
        reason: 'Stock redistribution',
        requestedBy: 'carol_warehouse',
        approvedBy: null,
        requiredBy: new Date(Date.now() + 3 * 24 * 3600 * 1000)
      },
      {
        materialId: 'MAT005',
        fromLocation: 'South Hub',
        toLocation: 'Central Warehouse',
        quantity: 7,
        reason: 'Consolidation',
        requestedBy: 'carol_warehouse',
        approvedBy: null,
        requiredBy: new Date(Date.now() + 7 * 24 * 3600 * 1000)
      }
    ];

    // 6) Disposal Materials (3)
    const disposals = [
      {
        materialId: 'MAT010',
        materialName: 'Damaged Table',
        inventoryName: 'Central Warehouse',
        quantity: 1,
        unit: 'pcs',
        requestedBy: 'carol_warehouse',
        reasonOfDisposal: 'Broken beyond repair',
        approvedBy: 'manager'
      },
      {
        materialId: 'MAT011',
        materialName: 'Expired Varnish',
        inventoryName: 'North Depot',
        quantity: 10,
        unit: 'litres',
        requestedBy: 'carol_warehouse',
        reasonOfDisposal: 'Expired',
        approvedBy: 'manager'
      },
      {
        materialId: 'MAT012',
        materialName: 'Rusty Screws',
        inventoryName: 'South Hub',
        quantity: 3,
        unit: 'boxes',
        requestedBy: 'carol_warehouse',
        reasonOfDisposal: 'Corrosion',
        approvedBy: 'manager'
      }
    ];

    // 7) Stock Reorder Requests (3)
    const srrs = [
      {
        inventoryId: 'IN001',
        inventoryName: 'Central Warehouse',
        inventoryAddress: '12 Industrial Ave, Colombo',
        inventoryContact: '+94770000001',
        materialId: 'RM001',
        materialName: 'Plywood Sheet',
        quantity: 200,
        type: 'Sheet',
        unit: 'sheets',
        expectedDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
        warehouseManagerName: 'carol_warehouse'
      },
      {
        inventoryId: 'IN002',
        inventoryName: 'North Depot',
        inventoryAddress: '45 Northern Rd, Jaffna',
        inventoryContact: '+94770000002',
        materialId: 'RM002',
        materialName: 'Varnish',
        quantity: 50,
        type: 'Liquid',
        unit: 'litres',
        expectedDate: new Date(Date.now() + 12 * 24 * 3600 * 1000),
        warehouseManagerName: 'carol_warehouse'
      },
      {
        inventoryId: 'IN003',
        inventoryName: 'South Hub',
        inventoryAddress: '8 Southern Blvd, Galle',
        inventoryContact: '+94770000003',
        materialId: 'RM003',
        materialName: 'Screws (4mm)',
        quantity: 100,
        type: 'Fastener',
        unit: 'boxes',
        expectedDate: new Date(Date.now() + 8 * 24 * 3600 * 1000),
        warehouseManagerName: 'carol_warehouse'
      }
    ];

    // 8) Threshold Alerts (3)
    const alerts = [
      {
        materialId: 'RM001',
        materialName: 'Plywood Sheet',
        currentLevel: 40,
        restockLevel: 100,
        inventoryName: 'Central Warehouse'
      },
      {
        materialId: 'RM002',
        materialName: 'Varnish',
        currentLevel: 10,
        restockLevel: 50,
        inventoryName: 'North Depot'
      },
      {
        materialId: 'RM003',
        materialName: 'Screws (4mm)',
        currentLevel: 5,
        restockLevel: 30,
        inventoryName: 'South Hub'
      }
    ];

    // 9) Audit Logs (3)
    const logs = [
      {
        entity: 'Raw Materials',
        action: 'insert',
        keyInfo: 'Inserted 200 Plywood Sheets',
        createdBy: 'carol_warehouse'
      },
      {
        entity: 'Stock Movement',
        action: 'transfer',
        keyInfo: 'Moved 10 boxes of screws to Central Warehouse',
        createdBy: 'carol_warehouse'
      },
      {
        entity: 'Disposal Material',
        action: 'dispose',
        keyInfo: 'Disposed 1 damaged table',
        createdBy: 'carol_warehouse'
      }
    ];

    // Insert documents using Model.create (ensures middleware runs)
    console.log('🌱 Seeding warehouse data...');

    await seedCollection(InvLocation, invs, 'InvLocations');
    await seedCollection(ManuProduct, manus, 'ManuProducts');
    await seedCollection(RawMaterial, raws, 'RawMaterials');
    await seedCollection(StockMovement, movements, 'StockMovements');
    await seedCollection(TransferRequest, transfers, 'TransferRequests');
    await seedCollection(DisposalMaterial, disposals, 'DisposalMaterials');
    await seedCollection(SReorderRequest, srrs, 'SReorderRequests');
    await seedCollection(ThresholdAlert, alerts, 'ThresholdAlerts');
    await seedCollection(AuditLog, logs, 'AuditLogs');

    console.log('\n✅ Warehouse seeding complete');
  } catch (err) {
    console.error('❌ Error seeding warehouse data:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
};

// Run the seed script when executed directly
const run = async () => {
  await connectDB();
  await seedWarehouse();
};

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

export default run;
