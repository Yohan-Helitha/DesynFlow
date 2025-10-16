import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Supplier from '../modules/supplier/model/supplier.model.js';
import Material from '../modules/supplier/model/material.model.js';
import MaterialCatalog from '../modules/supplier/model/materialCatalog.model.js';

const mongoURI = process.env.MONGO_URI;

async function seedMaterialCatalog() {
  let timeoutId;
  try {
    // Set a timeout to prevent hanging
    timeoutId = setTimeout(() => {
      console.error('❌ Script timed out after 30 seconds');
      process.exit(1);
    }, 30000);

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    console.log('📊 Fetching existing suppliers and materials...');
    const suppliers = await Supplier.find({});
    const materials = await Material.find({});

    if (suppliers.length === 0 || materials.length === 0) {
      console.log('❌ No suppliers or materials found. Please run seedComprehensiveData.js first');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`Found ${suppliers.length} suppliers and ${materials.length} materials`);

    console.log('🗑️ Clearing existing material catalog data...');
    await MaterialCatalog.deleteMany({});
    console.log('✅ Cleared existing material catalog data');

    console.log('\\n📦 Creating material catalog entries...');
    const catalogEntries = [];

    // Helper: Get base pricing for a material
    const getMaterialPrice = (materialName) => {
      const name = materialName.toLowerCase();
      if (name.includes('cement')) return 1850 + Math.random() * 300 - 150;
      if (name.includes('steel') || name.includes('rebar')) return 185 + Math.random() * 40 - 20;
      if (name.includes('sand')) return 4500 + Math.random() * 1000 - 500;
      if (name.includes('gravel')) return 5200 + Math.random() * 800 - 400;
      if (name.includes('brick')) return 85 + Math.random() * 30 - 15;
      if (name.includes('tile')) return 1250 + Math.random() * 400 - 200;
      if (name.includes('paint')) return 3200 + Math.random() * 600 - 300;
      if (name.includes('pipe') || name.includes('pvc')) return 890 + Math.random() * 200 - 100;
      if (name.includes('wire') || name.includes('cable')) return 45 + Math.random() * 16 - 8;
      if (name.includes('wood') || name.includes('timber') || name.includes('teak')) return 8500 + Math.random() * 2000 - 1000;
      if (name.includes('glass')) return 1450 + Math.random() * 400 - 200;
      if (name.includes('aluminum') || name.includes('frame')) return 12500 + Math.random() * 3000 - 1500;
      if (name.includes('roof')) return 95 + Math.random() * 30 - 15;
      if (name.includes('light') || name.includes('led') || name.includes('lamp')) return 1650 + Math.random() * 500 - 250;
      if (name.includes('fixture') || name.includes('fitting')) return 15000 + Math.random() * 4000 - 2000;
      return 1000 + Math.random() * 400 - 200; // Default
    };

    // Helper: Check if supplier should have this material
    const supplierHasMaterial = (supplierName, materialName) => {
      const sName = supplierName.toLowerCase();
      const mName = materialName.toLowerCase();
      
      if (sName.includes('cement') && mName.includes('cement')) return 'specialty';
      if (sName.includes('steel') && (mName.includes('steel') || mName.includes('rebar'))) return 'specialty';
      if ((sName.includes('brick') || sName.includes('tile')) && (mName.includes('brick') || mName.includes('tile'))) return 'specialty';
      if (sName.includes('paint') && mName.includes('paint')) return 'specialty';
      if ((sName.includes('wood') || sName.includes('timber') || sName.includes('teak')) && (mName.includes('wood') || mName.includes('timber'))) return 'specialty';
      if (sName.includes('glass') && (mName.includes('glass') || mName.includes('aluminum'))) return 'specialty';
      if (sName.includes('electrical') && (mName.includes('wire') || mName.includes('cable') || mName.includes('light'))) return 'specialty';
      if (sName.includes('plumbing') && (mName.includes('pipe') || mName.includes('pvc'))) return 'specialty';
      
      // General building supplies carry common materials
      if (mName.includes('cement') || mName.includes('sand') || mName.includes('gravel') || mName.includes('brick')) {
        return Math.random() > 0.5 ? 'general' : null;
      }
      
      return null;
    };

    // Create catalog entries
    for (const supplier of suppliers) {
      let materialCount = 0;
      
      for (const material of materials) {
        const relationship = supplierHasMaterial(supplier.companyName, material.materialName);
        
        if (relationship) {
          const pricePerUnit = Math.max(10, Math.round(getMaterialPrice(material.materialName)));
          const leadTimeDays = relationship === 'specialty' ? 
            Math.floor(Math.random() * 10) + 3 :  // 3-12 days for specialty
            Math.floor(Math.random() * 14) + 5;    // 5-18 days for general
          const active = Math.random() > (relationship === 'specialty' ? 0.05 : 0.15); // Higher active rate for specialty
          
          catalogEntries.push({
            supplierId: supplier._id,
            materialId: material._id,
            pricePerUnit,
            leadTimeDays,
            active
          });
          materialCount++;
        }
      }
      
      // If supplier has very few materials, add some random ones
      if (materialCount < 2) {
        const randomMaterials = materials
          .filter(m => !catalogEntries.find(e => e.supplierId.equals(supplier._id) && e.materialId.equals(m._id)))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        for (const material of randomMaterials) {
          catalogEntries.push({
            supplierId: supplier._id,
            materialId: material._id,
            pricePerUnit: Math.max(10, Math.round(getMaterialPrice(material.materialName))),
            leadTimeDays: Math.floor(Math.random() * 14) + 5,
            active: Math.random() > 0.2
          });
          materialCount++;
        }
      }
      
      console.log(`   • ${supplier.companyName}: ${materialCount} materials`);
    }

    console.log(`\\nTotal entries to insert: ${catalogEntries.length}`);

    if (catalogEntries.length > 0) {
      const createdEntries = await MaterialCatalog.insertMany(catalogEntries);
      console.log(`✅ Created ${createdEntries.length} material catalog entries`);

      // Statistics
      console.log('\\n📊 MATERIAL CATALOG SUMMARY');
      console.log('=' + '='.repeat(60));
      
      const activeCount = createdEntries.filter(e => e.active).length;
      const prices = createdEntries.map(e => e.pricePerUnit);
      const leadTimes = createdEntries.map(e => e.leadTimeDays);
      
      console.log(`Total Entries: ${createdEntries.length}`);
      console.log(`Active: ${activeCount} (${Math.round(activeCount/createdEntries.length*100)}%)`);
      console.log(`Avg Price: LKR ${Math.round(prices.reduce((a,b)=>a+b,0)/prices.length).toLocaleString()}`);
      console.log(`Price Range: LKR ${Math.min(...prices).toLocaleString()} - ${Math.max(...prices).toLocaleString()}`);
      console.log(`Avg Lead Time: ${Math.round(leadTimes.reduce((a,b)=>a+b,0)/leadTimes.length)} days`);
      console.log(`Lead Time Range: ${Math.min(...leadTimes)} - ${Math.max(...leadTimes)} days`);
      
      console.log('\\n📋 Sample Entries:');
      for (let i = 0; i < Math.min(5, createdEntries.length); i++) {
        const entry = createdEntries[i];
        const supplier = suppliers.find(s => s._id.equals(entry.supplierId));
        const material = materials.find(m => m._id.equals(entry.materialId));
        console.log(`   ${supplier.companyName} → ${material.materialName}`);
        console.log(`   LKR ${entry.pricePerUnit.toLocaleString()} | ${entry.leadTimeDays} days | ${entry.active ? 'Active' : 'Inactive'}`);
      }
      
      console.log('=' + '='.repeat(60));
    }

    await mongoose.disconnect();
    clearTimeout(timeoutId);
    console.log('\\n🔚 Database connection closed');
    console.log('✅ Material catalog seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMaterialCatalog();
}

export default seedMaterialCatalog;
