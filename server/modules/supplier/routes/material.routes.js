import express from 'express';
import MaterialCatalog from '../model/materialCatalog.model.js';

const router = express.Router();

// GET /api/materials - return all materials
router.get('/', async (req, res) => {
  try {
    const { supplierId } = req.query;
    let materials;
    if (supplierId) {
      materials = await MaterialCatalog.find({ supplierId });
    } else {
      materials = await MaterialCatalog.find();
    }
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
