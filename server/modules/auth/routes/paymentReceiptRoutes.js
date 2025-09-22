import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import PaymentReceipt from '../model/paymentReceipt.model.js';
import {
  uploadReceipt,
  verifyPaymentReceipt,
  getPaymentReceiptStatus,
  getAllPaymentReceipts,
  generatePaymentLinkForClient,
  sendPaymentDetailsEmail
} from '../controller/paymentReceiptController.js';
import CSRNotificationService from '../../../services/csrNotificationService.js';

// Enhanced multer configuration for secure file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/payment-receipts/');
  },
  filename: function (req, file, cb) {
    // Generate secure filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `receipt_${uniqueSuffix}_${sanitizedName}`);
  }
});

// File filter for payment receipts (images and PDFs only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/i;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and PDF files are allowed for payment receipts!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file per upload
  }
});

const router = Router();

// ===== PUBLIC ROUTES (One-time token access) =====

// Upload receipt via secure one-time token link (PUBLIC - accessed via email)
router.post('/upload/:token', 
  upload.single('receiptFile'), 
  uploadReceipt
);

// ===== CSR ROUTES (Customer Service Representative) =====

// Generate payment link and send to client (CSR only)
router.post('/generate-payment-link', 
  authMiddleware,
  roleMiddleware(['csr']),
  generatePaymentLinkForClient
);

// Send payment details email to client (CSR only)
router.post('/send-payment-email/:receiptId',
  authMiddleware,
  roleMiddleware(['csr']),
  sendPaymentDetailsEmail
);

// CSR quick payment request (generate + send in one call)
router.post('/request-payment',
  authMiddleware,
  roleMiddleware(['csr']),
  async (req, res) => {
    try {
      const { inspectionRequestId, clientId, calculatedAmount, paymentDueDate } = req.body;
      
      // Generate payment link
      const linkResponse = await CSRNotificationService.sendPaymentRequest(
        inspectionRequestId, 
        calculatedAmount, 
        paymentDueDate, 
        req.user._id
      );
      
      res.status(201).json({
        message: 'Payment request sent successfully to client',
        ...linkResponse
      });
      
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ===== FINANCE MANAGER ROUTES =====

// Verify or reject payment receipt (Finance Manager only)
router.patch('/verify/:receiptId',
  authMiddleware,
  roleMiddleware(['finance manager']),
  verifyPaymentReceipt
);

// Get all payment receipts with filtering (Finance Manager only)
router.get('/all',
  authMiddleware,
  roleMiddleware(['finance manager']),
  getAllPaymentReceipts
);

// Finance dashboard summary
router.get('/summary',
  authMiddleware,
  roleMiddleware(['finance manager']),
  async (req, res) => {
    try {
      const [uploaded, verified, rejected, expired] = await Promise.all([
        PaymentReceipt.countDocuments({ status: 'uploaded' }),
        PaymentReceipt.countDocuments({ status: 'verified' }),
        PaymentReceipt.countDocuments({ status: 'rejected' }),
        PaymentReceipt.countDocuments({ status: 'expired' })
      ]);
      
      res.json({
        summary: {
          pendingVerification: uploaded,
          verified: verified,
          rejected: rejected,
          expired: expired,
          total: uploaded + verified + rejected + expired
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ===== SHARED ROUTES (Multiple roles) =====

// Get specific receipt status (CSR, Finance Manager, Admin)
router.get('/status/:receiptId',
  authMiddleware,
  roleMiddleware(['csr', 'finance manager', 'admin']),
  getPaymentReceiptStatus
);

// Client's own receipt status (Client only)
router.get('/client-status/:receiptId',
  authMiddleware,
  roleMiddleware(['client']),
  async (req, res) => {
    try {
      const { receiptId } = req.params;
      const clientId = req.user._id;
      
      const receipt = await PaymentReceipt.findOne({
        _id: receiptId,
        client: clientId
      }).populate('inspectionRequest', 'propertyLocation.address');
      
      if (!receipt) {
        return res.status(404).json({ message: 'Receipt not found or access denied' });
      }
      
      res.json({
        receiptId: receipt._id,
        status: receipt.status,
        calculatedAmount: receipt.calculatedAmount,
        paymentDueDate: receipt.paymentDueDate,
        uploadedAt: receipt.tokenUsedAt,
        verifiedAt: receipt.verifiedAt,
        rejectionReason: receipt.rejectionReason,
        propertyAddress: receipt.inspectionRequest.propertyLocation.address
      });
      
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ===== ADMIN ROUTES =====

// Admin can access all receipt functions
router.get('/admin/all',
  authMiddleware,
  roleMiddleware(['admin']),
  getAllPaymentReceipts
);

// Cleanup expired tokens (Admin only - can be run as cron job)
router.post('/admin/cleanup-expired',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    try {
      const expiredReceipts = await PaymentReceipt.updateMany(
        { 
          tokenExpires: { $lt: new Date() },
          status: 'awaiting_upload'
        },
        { 
          status: 'expired' 
        }
      );
      
      res.json({
        message: 'Expired tokens cleaned up',
        expiredCount: expiredReceipts.modifiedCount
      });
      
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size allowed is 5MB.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Only one file allowed per upload.' 
      });
    }
  }
  
  if (error.message.includes('Only JPEG, PNG, and PDF files are allowed')) {
    return res.status(400).json({ 
      message: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.' 
    });
  }
  
  res.status(500).json({ message: error.message });
});

export default router;