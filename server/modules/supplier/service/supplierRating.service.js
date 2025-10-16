import SupplierRating from '../model/supplierRating.model.js';
import Supplier from '../model/supplier.model.js';

// Add feedback after delivery
const addRating = async (data) => {
  const { supplierId, criteria } = data;
  const { timeliness, quality, communication } = criteria;

  // Weighted score: 50% timeliness, 30% quality, 20% communication
  const weightedScore = (timeliness * 0.5) + (quality * 0.3) + (communication * 0.2);

  const rating = new SupplierRating({
    supplierId,
    ratedBy: data.ratedBy || null,
    criteria,
    weightedScore
  });

  await rating.save();

  // Update supplier's average rating
  const ratings = await SupplierRating.find({ supplierId });
  const avgScore = ratings.reduce((sum, r) => sum + r.weightedScore, 0) / ratings.length;

  await Supplier.findByIdAndUpdate(supplierId, { rating: avgScore });

  return { rating, averageRating: avgScore };
};

// Get top-rated suppliers
const getTopRatedSuppliers = async () => {
  try {
    // Import PurchaseOrder here to avoid circular imports
    const { default: PurchaseOrder } = await import('../model/purchaseOrder.model.js');
    
    const suppliers = await Supplier.find().sort({ rating: -1 }).limit(10);
    
    // Calculate additional metrics for each supplier
    const suppliersWithMetrics = await Promise.all(
      suppliers.map(async (supplier) => {
        // Count total orders for this supplier
        const totalOrders = await PurchaseOrder.countDocuments({ 
          supplierId: supplier._id 
        });
        
        // Calculate completed orders
        const completedOrders = await PurchaseOrder.countDocuments({ 
          supplierId: supplier._id,
          status: { $in: ['completed', 'received', 'delivered'] }
        });
        
        return {
          ...supplier.toObject(),
          name: supplier.companyName || supplier.name,
          averageRating: supplier.rating || 0,
          totalOrders,
          completedOrders,
          greenFlag: (supplier.rating || 0) >= 4.5,
          successRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
        };
      })
    );
    
    // Sort by rating descending, then by total orders
    return suppliersWithMetrics
      .filter(s => s.averageRating > 0) // Only include rated suppliers
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.totalOrders - a.totalOrders;
      });
      
  } catch (error) {
    console.error('Error fetching top suppliers:', error);
    return [];
  }
};

// Get ratings for a specific supplier
const getSupplierRatings = async (supplierId) => {
  try {
    const ratings = await SupplierRating.find({ supplierId })
      .populate('ratedBy', 'name email')
      .sort({ createdAt: -1 });
    
    const supplier = await Supplier.findById(supplierId);
    
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    const avgRating = supplier.rating || 0;
    const totalRatings = ratings.length;
    
    return {
      supplier: {
        _id: supplier._id,
        name: supplier.companyName || supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        averageRating: avgRating
      },
      ratings,
      totalRatings,
      averageRating: avgRating
    };
  } catch (error) {
    console.error('Error fetching supplier ratings:', error);
    throw error;
  }
};

export default {
  addRating,
  getTopRatedSuppliers,
  getSupplierRatings
};
