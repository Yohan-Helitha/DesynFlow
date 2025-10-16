
import SupplierService from '../service/supplier.service.js';

// Add new supplier
export const addSupplier = async (req, res) => {
  try {
    const supplier = await SupplierService.createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update supplier details
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await SupplierService.updateSupplier(req.params.id, req.body);
    res.status(200).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await SupplierService.getAllSuppliers();
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
  // Delete supplier
  export const deleteSupplier = async (req, res) => {
    try {
      await SupplierService.deleteSupplier(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

// Link suppliers to users automatically
export const linkSuppliersToUsers = async (req, res) => {
  try {
    const User = (await import('../../auth/model/user.model.js')).default;
    const Supplier = (await import('../model/supplier.model.js')).default;
    
    // Find all users with role 'supplier'
    const supplierUsers = await User.find({ role: 'supplier' });
    let linked = 0;
    let created = 0;

    for (const user of supplierUsers) {
      const supplier = await Supplier.findOne({ email: user.email });
      
      if (supplier && !supplier.userId) {
        // Update existing supplier with userId
        await Supplier.updateOne(
          { _id: supplier._id },
          { $set: { userId: user._id } }
        );
        linked++;
      } else if (!supplier) {
        // Create new supplier for this user
        const newSupplier = new Supplier({
          userId: user._id,
          email: user.email,
          contactName: user.username,
          companyName: user.username + ' Company',
          phone: user.phone || '',
          materialTypes: [],
          materials: [],
          deliveryRegions: [],
          rating: 0
        });
        await newSupplier.save();
        created++;
      }
    }

    res.status(200).json({ 
      message: 'Suppliers linked to users successfully',
      linked,
      created,
      total: supplierUsers.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
