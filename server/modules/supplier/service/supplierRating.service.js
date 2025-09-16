import SupplierRating from '../model/supplierRating.model.js';
import Supplier from '../model/supplier.model.js';

// Add feedback after delivery
const addRating = async (data) => {
  // data: { supplierId, timeliness, productQuality, communication }
  // Weighted score: 50% timeliness, 30% productQuality, 20% communication
  const score = (data.timeliness * 0.5) + (data.productQuality * 0.3) + (data.communication * 0.2);
  const rating = new SupplierRating({ ...data, score });
  await rating.save();
  // Optionally update supplier's average rating
  const ratings = await SupplierRating.find({ supplierId: data.supplierId });
  const avgScore = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
  await Supplier.findByIdAndUpdate(data.supplierId, { rating: avgScore });
  return rating;
};

// Get top-rated suppliers, green-flagged
const getTopRatedSuppliers = async () => {
  // Get all suppliers sorted by rating descending
  const suppliers = await Supplier.find().sort({ rating: -1 });
  // Green-flag top-rated suppliers (e.g., rating >= 4.5)
  return suppliers.map(s => ({ ...s.toObject(), greenFlag: s.rating >= 4.5 }));
};

export default {
  addRating,
  getTopRatedSuppliers
};
