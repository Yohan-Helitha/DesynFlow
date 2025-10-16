import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Supplier from '../modules/supplier/model/supplier.model.js';
import Material from '../modules/supplier/model/material.model.js';
import MaterialCatalog from '../modules/supplier/model/materialCatalog.model.js';

const mongoURI = process.env.MONGO_URI;

async function simpleTest() {
  try {
    console.log('🔗 Connecting...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected');

    const suppliers = await Supplier.find({}).limit(2);
    const materials = await Material.find({}).limit(3);

    console.log(`\nGot ${suppliers.length} suppliers, ${materials.length} materials`);

    if (suppliers.length > 0 && materials.length > 0) {
      console.log('\nCreating test entries...');
      
      const testEntries = [
        {
          supplierId: suppliers[0]._id,
          materialId: materials[0]._id,
          pricePerUnit: 1500,
          leadTimeDays: 5,
          active: true
        },
        {
          supplierId: suppliers[0]._id,
          materialId: materials[1]._id,
          pricePerUnit: 2000,
          leadTimeDays: 7,
          active: true
        }
      ];

      console.log('Test entries:', JSON.stringify(testEntries, null, 2));

      const result = await MaterialCatalog.insertMany(testEntries);
      console.log(`✅ Created ${result.length} entries`);

      const count = await MaterialCatalog.countDocuments();
      console.log(`Total in DB: ${count}`);
    }

    await mongoose.disconnect();
    console.log('🔚 Done');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

simpleTest();
