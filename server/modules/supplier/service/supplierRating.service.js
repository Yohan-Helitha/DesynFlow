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
  const suppliers = await Supplier.find().sort({ rating: -1 });
  return suppliers.map(s => ({
    ...s.toObject(),
    greenFlag: s.rating >= 4.5
  }));
};

export default {
  addRating,
  getTopRatedSuppliers
};
