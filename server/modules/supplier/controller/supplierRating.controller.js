import SupplierRatingService from '../service/supplierRating.service.js';

// Record feedback after delivery
export const addRating = async (req, res) => {
  try {
    console.log("Incoming supplier rating payload:", req.body);
  const result = await SupplierRatingService.addRating(req.body);
  console.log("Saved rating with weightedScore:", result.rating.weightedScore, " New average:", result.averageRating);
  res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get top-rated suppliers
export const getTopRatedSuppliers = async (req, res) => {
  try {
    const suppliers = await SupplierRatingService.getTopRatedSuppliers();
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
