import { Router } from 'express';
import {
  updateLocation,
  getAllLocations,
  getInspectorLocation
} from '../controller/inspectorLocationController.js';

const router = Router();

// Route: Update or create inspector's live location (inspector dashboard)
router.post('/update', updateLocation);

// Route: Get all inspectors' locations (CSR dashboard)
router.get('/all', getAllLocations);

// Route: Get a single inspector's location
router.get('/:inspectorId', getInspectorLocation);

export default router;