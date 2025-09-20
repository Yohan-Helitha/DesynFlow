import { Router } from 'express';
import multer from 'multer';
import {
  uploadReceipt,
  verifyReceipt,
  getReceiptStatus,
  generateUploadLink
} from '../controller/paymentReceiptController.js';

// Configure multer for file uploads (disk storage, adjust as needed)
const upload = multer({ dest: 'uploads/receipts/' });

const router = Router();

// Route: Upload receipt via secure token link (public, via email link)
router.post('/upload/:token', upload.single('receiptFile'), uploadReceipt);

// Route: Finance/admin verifies or rejects receipt (protected, add auth middleware as needed)
router.patch('/verify/:receiptId', verifyReceipt);

// Route: Get receipt status/details (protected, add auth middleware as needed)
router.get('/status/:receiptId', getReceiptStatus);

// Route: Generate secure upload link (protected, add auth middleware as needed)
router.post('/generate-link', generateUploadLink);

export default router;