import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Supplier from '../modules/supplier/model/supplier.model.js';
import Material from '../modules/supplier/model/material.model.js';
import MaterialCatalog from '../modules/supplier/model/materialCatalog.model.js';

(async () => {
  console.log('[1] Starting...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[2] Connected');
  
  const suppliers = await Supplier.find({});
  const materials = await Material.find({});
  console.log(`[3] Got ${suppliers.length} suppliers, ${materials.length} materials`);
  
  await MaterialCatalog.deleteMany({});
  console.log('[4] Cleared catalog');
  
  const entries = [];
  
  // Helper to get realistic price for a material
  const getPrice = (materialName) => {
    const name = materialName.toLowerCase();
    if (name.includes('cement')) return 1700 + Math.random() * 300;
    if (name.includes('steel') || name.includes('rebar')) return 180 + Math.random() * 30;
    if (name.includes('sand')) return 4000 + Math.random() * 1000;
    if (name.includes('gravel')) return 5000 + Math.random() * 800;
    if (name.includes('brick')) return 80 + Math.random() * 20;
    if (name.includes('tile')) return 1200 + Math.random() * 300;
    if (name.includes('paint')) return 3000 + Math.random() * 500;
    if (name.includes('pipe')) return 800 + Math.random() * 200;
    if (name.includes('wire')) return 40 + Math.random() * 15;
    if (name.includes('wood') || name.includes('timber')) return 8000 + Math.random() * 2000;
    if (name.includes('glass')) return 1400 + Math.random() * 300;
    if (name.includes('aluminum')) return 12000 + Math.random() * 2000;
    if (name.includes('roof')) return 90 + Math.random() * 20;
    return 1000 + Math.random() * 500;
  };
  
  // Helper to check if supplier should carry material
  const shouldCarry = (supplierName, materialName) => {
    const sName = supplierName.toLowerCase();
    const mName = materialName.toLowerCase();
    
    // Specialty matches
    if (sName.includes('cement') && mName.includes('cement')) return 'specialty';
    if (sName.includes('steel') && (mName.includes('steel') || mName.includes('rebar'))) return 'specialty';
    if ((sName.includes('brick') || sName.includes('tile')) && (mName.includes('brick') || mName.includes('tile'))) return 'specialty';
    if (sName.includes('paint') && mName.includes('paint')) return 'specialty';
    if ((sName.includes('wood') || sName.includes('timber')) && (mName.includes('wood') || mName.includes('timber'))) return 'specialty';
    if (sName.includes('glass') && (mName.includes('glass') || mName.includes('aluminum'))) return 'specialty';
    
    // General suppliers carry common materials
    if (mName.includes('cement') || mName.includes('sand') || mName.includes('gravel') || mName.includes('brick')) {
      return Math.random() > 0.4 ? 'general' : null;
    }
    
    // Random chance for other materials
    return Math.random() > 0.7 ? 'random' : null;
  };
  
  // Create catalog entries for each supplier
  for (const supplier of suppliers) {
    let count = 0;
    for (const material of materials) {
      const relationship = shouldCarry(supplier.companyName, material.materialName);
      
      if (relationship) {
        entries.push({
          supplierId: supplier._id,
          materialId: material._id,
          pricePerUnit: Math.round(getPrice(material.materialName)),
          leadTimeDays: relationship === 'specialty' ? 
            3 + Math.floor(Math.random() * 8) : // 3-10 days for specialty
            5 + Math.floor(Math.random() * 12), // 5-16 days for others
          active: Math.random() > (relationship === 'specialty' ? 0.05 : 0.15) // Higher active rate for specialty
        });
        count++;
      }
    }
    
    // Ensure each supplier has at least 3 materials
    if (count < 3) {
      const remaining = materials.filter(m => 
        !entries.find(e => e.supplierId.equals(supplier._id) && e.materialId.equals(m._id))
      ).slice(0, 3 - count);
      
      for (const material of remaining) {
        entries.push({
          supplierId: supplier._id,
          materialId: material._id,
          pricePerUnit: Math.round(getPrice(material.materialName)),
          leadTimeDays: 7 + Math.floor(Math.random() * 10),
          active: Math.random() > 0.2
        });
        count++;
      }
    }
    
    console.log(`   ${supplier.companyName}: ${count} materials`);
  }
  
  console.log(`[5] Created ${entries.length} entries array`);
  
  const result = await MaterialCatalog.insertMany(entries);
  console.log(`[6] Inserted ${result.length} entries`);
  
  // Show statistics
  const activeCount = result.filter(e => e.active).length;
  const prices = result.map(e => e.pricePerUnit);
  const avgPrice = Math.round(prices.reduce((a,b)=>a+b,0) / prices.length);
  
  console.log(`\\n✅ Success!`);
  console.log(`   Total: ${result.length} entries`);
  console.log(`   Active: ${activeCount} (${Math.round(activeCount/result.length*100)}%)`);
  console.log(`   Avg Price: LKR ${avgPrice.toLocaleString()}`);
  
  await mongoose.disconnect();
  console.log('[7] Disconnected');
  process.exit(0);
})().catch(e => {
  console.error('ERROR:', e);
  process.exit(1);
});
