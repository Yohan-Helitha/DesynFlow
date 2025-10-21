import Supplier from '../model/supplier.model.js';

const createSupplier = async (data) => {
  // First create a user account for the supplier
  const User = (await import('../../auth/model/user.model.js')).default;
  
  // Check if user with this email already exists
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('A user with this email already exists');
  }
  
  // Create user account with supplier role
  const userData = {
    username: data.contactName,
    email: data.email,
    password: data.password,
    role: 'supplier',
    phone: data.phone
  };
  
  const user = new User(userData);
  const savedUser = await user.save();
  
  // Create supplier profile linked to the user
  const supplierData = {
    ...data,
    userId: savedUser._id
  };
  
  const supplier = new Supplier(supplierData);
  const savedSupplier = await supplier.save();
  
  // If materials with pricing are provided, also create entries in MaterialCatalog
  if (data.materials && data.materials.length > 0) {
    const MaterialCatalog = (await import('../model/materialCatalog.model.js')).default;
    const Material = (await import('../model/material.model.js')).default;
    
    // Create or find materials and add to catalog
    for (const material of data.materials) {
      try {
        // Find or create the material in the Material collection
        let materialDoc = await Material.findOne({ materialName: material.name });
        
        if (!materialDoc) {
          // Create a new material entry with info from frontend
          materialDoc = new Material({
            materialId: `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            materialName: material.name,
            category: material.category || 'General',
            type: material.type || 'Raw Material',
            unit: material.unit || 'piece',
            warrantyPeriod: material.warrantyPeriod || undefined
          });
          materialDoc = await materialDoc.save();
        } else {
          // Update existing material with new info if provided
          if (material.category && material.category !== materialDoc.category) {
            materialDoc.category = material.category;
          }
          if (material.type && material.type !== materialDoc.type) {
            materialDoc.type = material.type;
          }
          if (material.unit && material.unit !== materialDoc.unit) {
            materialDoc.unit = material.unit;
          }
          if (material.warrantyPeriod !== undefined && material.warrantyPeriod !== materialDoc.warrantyPeriod) {
            materialDoc.warrantyPeriod = material.warrantyPeriod;
          }
          await materialDoc.save();
        }
        
        // Create or update catalog entry
        await MaterialCatalog.findOneAndUpdate(
          { supplierId: savedSupplier._id, materialId: materialDoc._id },
          { 
            pricePerUnit: material.pricePerUnit,
            leadTimeDays: 7, // Default lead time
            active: true 
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error(`Error processing material ${material.name}:`, err);
      }
    }
  }
  
  return savedSupplier;
};

const updateSupplier = async (id, data) => {
  const updatedSupplier = await Supplier.findByIdAndUpdate(id, data, { new: true });
  
  // If materials with pricing are provided, update MaterialCatalog
  if (data.materials && data.materials.length > 0) {
    const MaterialCatalog = (await import('../model/materialCatalog.model.js')).default;
    const Material = (await import('../model/material.model.js')).default;
    
    // Remove existing catalog entries for this supplier
    await MaterialCatalog.deleteMany({ supplierId: id });
    
    // Create or find materials and add to catalog
    for (const material of data.materials) {
      try {
        // Find or create the material in the Material collection
        let materialDoc = await Material.findOne({ materialName: material.name });
        
        if (!materialDoc) {
          // Create a new material entry with info from frontend
          materialDoc = new Material({
            materialId: `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            materialName: material.name,
            category: material.category || 'General',
            type: material.type || 'Raw Material',
            unit: material.unit || 'piece',
            warrantyPeriod: material.warrantyPeriod || undefined
          });
          materialDoc = await materialDoc.save();
        } else {
          // Update existing material with new info if provided
          if (material.category && material.category !== materialDoc.category) {
            materialDoc.category = material.category;
          }
          if (material.type && material.type !== materialDoc.type) {
            materialDoc.type = material.type;
          }
          if (material.unit && material.unit !== materialDoc.unit) {
            materialDoc.unit = material.unit;
          }
          if (material.warrantyPeriod !== undefined && material.warrantyPeriod !== materialDoc.warrantyPeriod) {
            materialDoc.warrantyPeriod = material.warrantyPeriod;
          }
          await materialDoc.save();
        }
        
        // Create catalog entry
        await MaterialCatalog.create({
          supplierId: id,
          materialId: materialDoc._id,
          pricePerUnit: material.pricePerUnit,
          leadTimeDays: 7, // Default lead time
          active: true 
        });
      } catch (err) {
        console.error(`Error processing material ${material.name}:`, err);
      }
    }
  }
  
  return updatedSupplier;
};

const getAllSuppliers = async () => {
  return await Supplier.find();
};

  const deleteSupplier = async (id) => {
    return await Supplier.findByIdAndDelete(id);
  };

export default {
  createSupplier,
  updateSupplier,
  getAllSuppliers
    ,deleteSupplier
};
