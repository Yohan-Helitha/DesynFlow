import express from 'express';
import { authMiddleware } from '../../auth/middleware/authMiddleware.js';
import { supplierMiddleware } from '../middleware/supplierMiddleware.js';

const router = express.Router();

// Login route (no authentication required)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Import User model dynamically
    const User = (await import('../../auth/model/user.model.js')).default;
    const Supplier = (await import('../model/supplier.model.js')).default;
    
    // Find user by email with supplier role
    const user = await User.findOne({ email, role: 'supplier' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Find the supplier profile
    const supplier = await Supplier.findOne({ userId: user._id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found' });
    }
    
    // Generate JWT token
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        supplierId: supplier._id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      supplier: {
        id: supplier._id,
        companyName: supplier.companyName,
        contactName: supplier.contactName,
        email: supplier.email
      }
    });
  } catch (error) {
    console.error('Supplier login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply middleware to protected routes only
router.use(authMiddleware);
router.use(supplierMiddleware);

// Get supplier profile
router.get('/profile', async (req, res) => {
  try {
    const Supplier = (await import('../model/supplier.model.js')).default;
    const supplier = await Supplier.findById(req.supplier.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.json({
      id: supplier._id,
      companyName: supplier.companyName,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      materialTypes: supplier.materialTypes,
      materials: supplier.materials,
      deliveryRegions: supplier.deliveryRegions,
      rating: supplier.rating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get supplier dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const Supplier = (await import('../model/supplier.model.js')).default;
    const PurchaseOrder = (await import('../model/purchaseOrder.model.js')).default;
    const Sample = (await import('../model/sampleOrder.model.js')).default;
    
    const supplier = await Supplier.findById(req.supplier.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Get supplier's orders
    const orders = await PurchaseOrder.find({ supplierId: req.supplier.id })
      .populate('projectId', 'projectName')
      .populate('requestedBy', 'name email')
      .populate('items.materialId', 'materialName category type unit')
      .sort({ createdAt: -1 });

    // Get supplier's samples
    const samples = await Sample.find({ supplierId: req.supplier.id })
      .populate('materialId', 'materialName')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    // Calculate stats
    const ordersStats = {
      active: orders.filter(o => o.status === 'Approved' || o.status === 'In Progress').length,
      completed: orders.filter(o => o.status === 'Completed').length,
      pending: orders.filter(o => o.status === 'Draft' || o.status === 'Pending').length,
      rejected: orders.filter(o => o.status === 'Rejected').length
    };

    const materialsStats = {
      totalMaterials: supplier.materials.length,
      materialCategories: [...new Set(supplier.materials.map(m => m.category))].length,
      lowStockCount: 0, // This would require inventory data
      topDemandMaterial: supplier.materials[0]?.name || 'N/A'
    };

    const performance = {
      onTimeDelivery: 95, // This would be calculated from actual delivery data
      qualityScore: supplier.rating * 20, // Convert 5-star rating to percentage
      responseTime: 24, // Hours - this would come from actual data
      totalOrders: orders.length,
      successRate: orders.length > 0 ? (ordersStats.completed / orders.length) * 100 : 0,
      customerSatisfaction: supplier.rating * 20
    };

    const earnings = {
      thisMonth: orders
        .filter(o => o.status === 'Completed' && new Date(o.updatedAt).getMonth() === new Date().getMonth())
        .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0),
      lastMonth: orders
        .filter(o => o.status === 'Completed' && new Date(o.updatedAt).getMonth() === new Date().getMonth() - 1)
        .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0),
      totalEarnings: orders
        .filter(o => o.status === 'Completed')
        .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0),
      pendingEarnings: orders
        .filter(o => o.status === 'Approved' || o.status === 'In Progress')
        .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0),
      growthRate: 0 // This would be calculated based on historical data
    };

    res.json({
      profile: {
        name: supplier.companyName,
        email: supplier.email,
        rating: supplier.rating,
        totalOrders: orders.length
      },
      orders: orders.slice(0, 10), // Recent orders
      ordersStats,
      materials: supplier.materials,
      materialsStats,
      performance,
      recentOrders: orders.slice(0, 5),
      requests: samples.slice(0, 5), // Recent sample requests
      earnings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;