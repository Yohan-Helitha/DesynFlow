import express from 'express';
import { getAllMaterials, getMaterialsWithPrices } from '../controller/materialController.js';

const router = express.Router();

router.get('/', getAllMaterials);
router.get('/priced', getMaterialsWithPrices);

export default router;
