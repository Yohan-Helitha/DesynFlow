import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  uploadReceipt,
  verifyPaymentReceipt,
  getPaymentReceiptStatus,
  generatePaymentLinkForClient
} from '../controller/paymentReceiptController.js';

const router = Router();

// ===== Multer storage for receipt uploads =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/payment-receipts/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `receipt_${uniqueSuffix}_${sanitized}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/i;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only JPEG, PNG, PDF allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }
});

// ===== Public (client) =====
router.post('/upload/:token', upload.single('receiptFile'), uploadReceipt);

// ===== CSR =====
router.post(
  '/generate-payment-link',
  authMiddleware,
  roleMiddleware(['csr']),
  generatePaymentLinkForClient
);

// ===== Finance =====
router.patch(
  '/verify/:receiptId',
  authMiddleware,
  roleMiddleware(['finance manager']),
  verifyPaymentReceipt
);

// ===== Shared (CSR, Finance, Admin, Client) =====
router.get(
  '/status/:receiptId',
  authMiddleware,
  roleMiddleware(['csr', 'finance manager', 'admin', 'client']),
  getPaymentReceiptStatus
);

export default router;
