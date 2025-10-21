import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const supplierMiddleware = async (req, res, next) => {
  try {
    // Check if user has supplier role or userType
    if (req.user.role !== 'supplier' && req.user.userType !== 'supplier') {
      return res.status(403).json({ message: 'Access denied. Supplier role required.' });
    }

    // If userType is supplier, get supplier data
    if (req.user.userType === 'supplier') {
      const Supplier = (await import('../model/supplier.model.js')).default;
      const supplier = await Supplier.findById(req.user.id);
      
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier profile not found' });
      }
      
      req.supplier = {
        id: supplier._id,
        companyName: supplier.companyName,
        contactName: supplier.contactName,
        email: supplier.email,
        userId: supplier.userId
      };
    } else {
      // For user accounts with supplier role, find linked supplier
      const Supplier = (await import('../model/supplier.model.js')).default;
      const supplier = await Supplier.findOne({ userId: req.user.id });
      
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier profile not found' });
      }
      
      req.supplier = {
        id: supplier._id,
        companyName: supplier.companyName,
        contactName: supplier.contactName,
        email: supplier.email,
        userId: supplier.userId
      };
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error in supplier middleware', error: error.message });
  }
};