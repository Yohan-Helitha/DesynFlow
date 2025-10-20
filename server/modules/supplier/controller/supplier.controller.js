
import SupplierService from '../service/supplier.service.js';
import Supplier from '../model/supplier.model.js';

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

// Get current supplier profile
export const getCurrentSupplier = async (req, res) => {
  try {
    console.log('getCurrentSupplier called');
    console.log('Headers received:', Object.keys(req.headers));
    
    // First, let's try to find any supplier to test if the endpoint works at all
    const allSuppliers = await Supplier.find().limit(1);
    console.log('Total suppliers in database:', allSuppliers.length);
    
    if (allSuppliers.length === 0) {
      return res.status(404).json({ error: 'No suppliers found in database' });
    }
    
    // Check for x-user-data header
    const userDataHeader = req.headers['x-user-data'];
    console.log('User data header:', userDataHeader);
    
    if (userDataHeader) {
      try {
        const userData = JSON.parse(userDataHeader);
        console.log('Parsed user data:', userData);
        
        if (userData.email) {
          console.log('Looking for supplier with email:', userData.email);
          const supplier = await Supplier.findOne({ email: userData.email });
          console.log('Found supplier by email:', supplier ? 'Yes' : 'No');
          
          if (supplier) {
            return res.status(200).json(supplier);
          }
          
          // If no supplier found by email, let's look by other means
          console.log('No supplier found by email, checking if user exists...');
          
          // Try to find user in User collection
          const User = (await import('../../auth/model/user.model.js')).default;
          const user = await User.findOne({ email: userData.email });
          console.log('Found user by email:', user ? 'Yes' : 'No');
          
          if (user) {
            // Check if supplier exists by userId
            const supplierByUserId = await Supplier.findOne({ userId: user._id });
            console.log('Found supplier by userId:', supplierByUserId ? 'Yes' : 'No');
            
            if (supplierByUserId) {
              return res.status(200).json(supplierByUserId);
            }
          }
        }
      } catch (parseErr) {
        console.error('Error parsing user data header:', parseErr);
        return res.status(400).json({ error: 'Invalid user data format' });
      }
    }
    
    // If we get here, return the first supplier as a test
    console.log('No valid user data found, returning first supplier as test');
    return res.status(200).json(allSuppliers[0]);
    
  } catch (err) {
    console.error('Error in getCurrentSupplier:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: err.message });
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
