import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Supplier from '../modules/supplier/model/supplier.model.js';
import Material from '../modules/supplier/model/material.model.js';
import MaterialCatalog from '../modules/supplier/model/materialCatalog.model.js';

const mongoURI = process.env.MONGO_URI;

async function checkData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const suppliers = await Supplier.find({});
    const materials = await Material.find({});
    const catalogs = await MaterialCatalog.find({});

    console.log('\n📊 Current Database Status:');
    console.log('=' + '='.repeat(50));
    console.log(`Suppliers: ${suppliers.length}`);
    console.log(`Materials: ${materials.length}`);
    console.log(`Material Catalog Entries: ${catalogs.length}`);
    console.log('=' + '='.repeat(50));

    if (suppliers.length > 0) {
      console.log('\n📦 Suppliers:');
      suppliers.slice(0, 5).forEach(s => {
        console.log(`  - ${s.companyName} (${s._id})`);
      });
      if (suppliers.length > 5) console.log(`  ... and ${suppliers.length - 5} more`);
    } else {
      console.log('\n❌ No suppliers found!');
    }

    if (materials.length > 0) {
      console.log('\n🔧 Materials:');
      materials.slice(0, 5).forEach(m => {
        console.log(`  - ${m.materialId}: ${m.materialName} (${m._id})`);
      });
      if (materials.length > 5) console.log(`  ... and ${materials.length - 5} more`);
    } else {
      console.log('\n❌ No materials found!');
    }

    if (catalogs.length > 0) {
      console.log('\n💰 Material Catalog Entries:');
      const populated = await MaterialCatalog.find({}).limit(5)
        .populate('supplierId', 'companyName')
        .populate('materialId', 'materialName');
      
      populated.forEach(c => {
        console.log(`  - ${c.supplierId?.companyName || 'Unknown'} → ${c.materialId?.materialName || 'Unknown'}`);
        console.log(`    Price: LKR ${c.pricePerUnit}, Lead: ${c.leadTimeDays} days, Active: ${c.active}`);
      });
      if (catalogs.length > 5) console.log(`  ... and ${catalogs.length - 5} more`);
    } else {
      console.log('\n❌ No material catalog entries found!');
    }

    await mongoose.disconnect();
    console.log('\n🔚 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
