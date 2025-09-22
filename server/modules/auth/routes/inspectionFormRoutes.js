import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
// import uploadMiddleware from '../middleware/uploadMiddleware.js'; // Uncomment if file uploads are needed

// Placeholder controller functions (replace with real implementations)
const createInspectionForm = (req, res) => res.status(501).json({ message: 'Not implemented' });
const getInspectionForms = (req, res) => res.status(501).json({ message: 'Not implemented' });
const getInspectionFormById = (req, res) => res.status(501).json({ message: 'Not implemented' });

const updateInspectionForm = (req, res) => res.status(501).json({ message: 'Not implemented' });
const deleteInspectionForm = (req, res) => res.status(501).json({ message: 'Not implemented' });

const router = express.Router();

// Create a new inspection form (inspector)
router.post(
	'/',
	authMiddleware,
	roleMiddleware(['inspector']),
	createInspectionForm
);

// Get all inspection forms (admin, csr, finance, inspector) read
router.get(
	'/',
	authMiddleware,
	roleMiddleware(['admin', 'csr', 'finance', 'inspector']),
	getInspectionForms
);

// Get a single inspection form by ID (all roles) read
router.get(
	'/:formId',
	authMiddleware,
	getInspectionFormById
);

// Update an inspection form (inspector)
router.patch(
	'/:formId',
	authMiddleware,
	roleMiddleware(['inspector']),
	updateInspectionForm
);


// Delete an inspection form (admin only)
router.delete(
	'/:formId',
	authMiddleware,
	roleMiddleware(['inspector']),
	deleteInspectionForm
);

export default router;
