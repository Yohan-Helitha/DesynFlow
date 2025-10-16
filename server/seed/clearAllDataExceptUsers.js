/**
 * Clear All Database Data Except Users
 * 
 * This script removes all data from all collections except the User collection.
 * Useful for resetting the system while preserving user accounts.
 * 
 * Usage: node server/seed/clearAllDataExceptUsers.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import all models except User
import Project from '../modules/project/model/project.model.js';
import Task from '../modules/project/model/task.model.js';
import Team from '../modules/project/model/team.model.js';
import Meeting from '../modules/project/model/meeting.model.js';
import Milestone from '../modules/project/model/milestone.model.js';
import ProgressUpdate from '../modules/project/model/progressupdate.model.js';
import Report from '../modules/project/model/report.model.js';
import Attendance from '../modules/project/model/attendance.model.js';
import ProjectMaterial from '../modules/project/model/material.model.js';

// Finance models
import Payment from '../modules/finance/model/payment.js';
import Expenses from '../modules/finance/model/expenses.js';
import FinanceSummary from '../modules/finance/model/finance_summary.js';
import InspectionEstimation from '../modules/finance/model/inspection_estimation.js';
import Quotation from '../modules/finance/model/quotation_estimation.js';
import ProjectEstimation from '../modules/finance/model/project_estimation.js';
import WarrantyClaim from '../modules/finance/model/warrenty_claim.js';
import Warranty from '../modules/finance/model/warrenty.js';
import FinanceNotification from '../modules/finance/model/financeNotification.js';

// Auth models (excluding User)
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';

// Supplier models
import Supplier from '../modules/supplier/model/supplier.model.js';
import Material from '../modules/supplier/model/material.model.js';
import MaterialCatalog from '../modules/supplier/model/materialCatalog.model.js';
import PurchaseOrder from '../modules/supplier/model/purchaseOrder.model.js';
import PurchaseOrderItem from '../modules/supplier/model/purchaseOrderItem.model.js';
import SampleOrder from '../modules/supplier/model/sampleOrder.model.js';
import SupplierRating from '../modules/supplier/model/supplierRating.model.js';
import SupplierRequestNotification from '../modules/supplier/model/supplierRequestNotification.model.js';
import SupplierStatusUpdate from '../modules/supplier/model/supplierStatusUpdate.model.js';

// Warehouse models
import RawMaterials from '../modules/warehouse-manager/model/rawMaterialsModel.js';
import ManuProducts from '../modules/warehouse-manager/model/manuProductsModel.js';
import InvLocations from '../modules/warehouse-manager/model/invLocationsModel.js';
import DisposalMaterials from '../modules/warehouse-manager/model/disposalMaterialsModel.js';
import StockMovement from '../modules/warehouse-manager/model/stockMovementModel.js';
import TransferRequest from '../modules/warehouse-manager/model/transferRequestModel.js';
import ThresholdAlert from '../modules/warehouse-manager/model/thresholdAlertModel.js';
import ReorderRequest from '../modules/warehouse-manager/model/sReorderRequestsModel.js';
import AuditLog from '../modules/warehouse-manager/model/auditLogModel.js';

import { connectDB } from '../config/db.js';

dotenv.config();

const COLLECTIONS_TO_CLEAR = [
  // Project collections
  { model: Project, name: 'Projects' },
  { model: Task, name: 'Tasks' },
  { model: Team, name: 'Teams' },
  { model: Meeting, name: 'Meetings' },
  { model: Milestone, name: 'Milestones' },
  { model: ProgressUpdate, name: 'ProgressUpdates' },
  { model: Report, name: 'Reports' },
  { model: Attendance, name: 'Attendances' },
  { model: ProjectMaterial, name: 'ProjectMaterials' },
  
  // Finance collections
  { model: Payment, name: 'Payments' },
  { model: Expenses, name: 'Expenses' },
  { model: FinanceSummary, name: 'FinanceSummaries' },
  { model: InspectionEstimation, name: 'InspectionEstimations' },
  { model: Quotation, name: 'Quotations' },
  { model: ProjectEstimation, name: 'ProjectEstimations' },
  { model: WarrantyClaim, name: 'WarrantyClaims' },
  { model: Warranty, name: 'Warranties' },
  { model: FinanceNotification, name: 'FinanceNotifications' },
  
  // Auth collections (excluding User)
  { model: InspectionRequest, name: 'InspectionRequests' },
  
  // Supplier collections
  { model: Supplier, name: 'Suppliers' },
  { model: Material, name: 'Materials' },
  { model: MaterialCatalog, name: 'MaterialCatalogs' },
  { model: PurchaseOrder, name: 'PurchaseOrders' },
  { model: PurchaseOrderItem, name: 'PurchaseOrderItems' },
  { model: SampleOrder, name: 'SampleOrders' },
  { model: SupplierRating, name: 'SupplierRatings' },
  { model: SupplierRequestNotification, name: 'SupplierRequestNotifications' },
  { model: SupplierStatusUpdate, name: 'SupplierStatusUpdates' },
  
  // Warehouse collections
  { model: RawMaterials, name: 'RawMaterials' },
  { model: ManuProducts, name: 'ManufacturedProducts' },
  { model: InvLocations, name: 'InventoryLocations' },
  { model: DisposalMaterials, name: 'DisposalMaterials' },
  { model: StockMovement, name: 'StockMovements' },
  { model: TransferRequest, name: 'TransferRequests' },
  { model: ThresholdAlert, name: 'ThresholdAlerts' },
  { model: ReorderRequest, name: 'ReorderRequests' },
  { model: AuditLog, name: 'AuditLogs' },
];

async function clearAllDataExceptUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    console.log('⚠️  WARNING: This will delete ALL data except Users!');
    console.log('📊 Collections to be cleared:\n');

    let totalDocuments = 0;
    const stats = [];

    // Count documents before deletion
    for (const collection of COLLECTIONS_TO_CLEAR) {
      try {
        const count = await collection.model.countDocuments();
        totalDocuments += count;
        stats.push({ name: collection.name, count });
        console.log(`   - ${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`   - ${collection.name}: Error counting (${error.message})`);
      }
    }

    console.log(`\n📈 Total documents to delete: ${totalDocuments}\n`);

    if (totalDocuments === 0) {
      console.log('ℹ️  No documents to delete. Database is already clean (except Users).');
      await mongoose.connection.close();
      console.log('✅ Database connection closed.');
      process.exit(0);
    }

    console.log('🗑️  Starting deletion process...\n');

    let deletedTotal = 0;
    const results = [];

    // Delete all documents from each collection
    for (const collection of COLLECTIONS_TO_CLEAR) {
      try {
        const result = await collection.model.deleteMany({});
        deletedTotal += result.deletedCount;
        results.push({
          name: collection.name,
          deleted: result.deletedCount,
          status: '✅'
        });
        console.log(`   ✅ ${collection.name}: Deleted ${result.deletedCount} documents`);
      } catch (error) {
        results.push({
          name: collection.name,
          deleted: 0,
          status: '❌',
          error: error.message
        });
        console.log(`   ❌ ${collection.name}: Error - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 DELETION SUMMARY');
    console.log('='.repeat(60) + '\n');

    console.log(`Total documents deleted: ${deletedTotal}/${totalDocuments}`);
    console.log(`Collections cleared: ${results.filter(r => r.status === '✅').length}/${COLLECTIONS_TO_CLEAR.length}`);

    const failed = results.filter(r => r.status === '❌');
    if (failed.length > 0) {
      console.log('\n⚠️  Failed collections:');
      failed.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
    }

    console.log('\n✅ User data preserved successfully!');
    console.log('🎉 Database cleanup completed!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Execute the script
console.log('\n' + '='.repeat(60));
console.log('🗑️  CLEAR ALL DATA EXCEPT USERS');
console.log('='.repeat(60) + '\n');

clearAllDataExceptUsers();

export { clearAllDataExceptUsers };
