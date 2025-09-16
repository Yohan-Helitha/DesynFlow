import SupplierRatingService from '../service/supplierRating.service.js';

// Record feedback after delivery
export const addRating = async (req, res) => {
  try {
    const rating = await SupplierRatingService.addRating(req.body);
    res.status(201).json(rating);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get top-rated suppliers (sorted, green-flagged)
export const getTopRatedSuppliers = async (req, res) => {
  try {
    const suppliers = await SupplierRatingService.getTopRatedSuppliers();
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
