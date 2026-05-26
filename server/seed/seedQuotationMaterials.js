import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Material from '../modules/supplier/model/material.model.js';
import Supplier from '../modules/supplier/model/supplier.model.js';
import MaterialCatalog from '../modules/supplier/model/materialCatalog.model.js';

dotenv.config();

const MATERIALS = [
  { materialId: 'MAT001', materialName: 'Portland Cement', category: 'Concrete', type: 'Raw Material', unit: 'bag', warrantyPeriod: null },
  { materialId: 'MAT002', materialName: 'Steel Rebar 12mm', category: 'Structural', type: 'Raw Material', unit: 'kg', warrantyPeriod: null },
  { materialId: 'MAT003', materialName: 'River Sand', category: 'Aggregate', type: 'Raw Material', unit: 'm3', warrantyPeriod: null },
  { materialId: 'MAT004', materialName: 'Gravel 20mm', category: 'Aggregate', type: 'Raw Material', unit: 'm3', warrantyPeriod: null },
  { materialId: 'MAT005', materialName: 'Bricks (Red clay)', category: 'Masonry', type: 'Finished Product', unit: 'piece', warrantyPeriod: null },
  { materialId: 'MAT006', materialName: 'Ceramic Floor Tiles 600x600', category: 'Finishing', type: 'Finished Product', unit: 'box', warrantyPeriod: '5 years' },
  { materialId: 'MAT007', materialName: 'Wall Paint (White) 20L', category: 'Finishing', type: 'Finished Product', unit: 'bucket', warrantyPeriod: '3 years' },
  { materialId: 'MAT008', materialName: 'PVC Pipe 4 inch', category: 'Plumbing', type: 'Finished Product', unit: 'meter', warrantyPeriod: '10 years' },
  { materialId: 'MAT009', materialName: 'Electrical Cable 2.5mm', category: 'Electrical', type: 'Raw Material', unit: 'meter', warrantyPeriod: null },
  { materialId: 'MAT010', materialName: 'LED Light Fixture', category: 'Electrical', type: 'Finished Product', unit: 'piece', warrantyPeriod: '2 years' },
  { materialId: 'MAT011', materialName: 'Wooden Door (Teak)', category: 'Carpentry', type: 'Finished Product', unit: 'piece', warrantyPeriod: '5 years' },
  { materialId: 'MAT012', materialName: 'Aluminum Window Frame', category: 'Windows', type: 'Finished Product', unit: 'piece', warrantyPeriod: '15 years' },
];

const DEFAULT_SUPPLIER = {
  companyName: 'Default Supplier',
  contactName: 'System',
  email: 'default.supplier@desynflow.local',
  phone: '+94000000000',
  password: 'Supplier@123',
  materialTypes: ['general'],
  deliveryRegions: ['Colombo'],
  rating: 4.0,
  isActive: true,
};

function getPrice(materialName) {
  const name = materialName.toLowerCase();
  if (name.includes('cement')) return 1850;
  if (name.includes('steel') || name.includes('rebar')) return 225;
  if (name.includes('sand')) return 4500;
  if (name.includes('gravel')) return 5200;
  if (name.includes('brick')) return 45;
  if (name.includes('tile')) return 1200;
  if (name.includes('paint')) return 8500;
  if (name.includes('pipe')) return 450;
  if (name.includes('cable')) return 85;
  if (name.includes('light')) return 2500;
  if (name.includes('door')) return 45000;
  if (name.includes('window')) return 12500;
  return 1000;
}

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  // Ensure supplier exists
  let supplier = await Supplier.findOne({ email: DEFAULT_SUPPLIER.email });
  if (!supplier) {
    supplier = await new Supplier(DEFAULT_SUPPLIER).save();
    console.log(`✅ Created supplier: ${supplier.companyName}`);
  } else {
    console.log(`ℹ️ Supplier exists: ${supplier.companyName}`);
  }

  // Ensure materials exist
  const ensuredMaterials = [];
  for (const def of MATERIALS) {
    let material = await Material.findOne({ materialId: def.materialId });
    if (!material) {
      material = await new Material(def).save();
      console.log(`✅ Created material: ${def.materialId} ${def.materialName}`);
    }
    ensuredMaterials.push(material);
  }

  // Ensure catalog entries exist (idempotent)
  for (const material of ensuredMaterials) {
    const exists = await MaterialCatalog.findOne({ supplierId: supplier._id, materialId: material._id });
    if (exists) continue;

    await MaterialCatalog.create({
      supplierId: supplier._id,
      materialId: material._id,
      pricePerUnit: getPrice(material.materialName),
      leadTimeDays: 7,
      active: true,
    });
  }

  const pricedCount = await MaterialCatalog.countDocuments({ active: true });
  const materialCount = await Material.countDocuments({});
  console.log(`\n✅ Done. Materials: ${materialCount}, Active catalog entries: ${pricedCount}`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
