import PaymentReceipt from '../model/paymentReceipt.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import User from '../model/user.model.js';
import { sendEmail } from '../../../utils/emailService.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Helper: Notify finance manager about new receipt upload
async function notifyFinanceManager(receipt) {
  try {
    // Find finance managers
    const financeManagers = await User.find({ role: 'finance manager' });
    
    if (financeManagers.length === 0) return;
    
    const receiptData = await PaymentReceipt.findById(receipt._id)
      .populate('client', 'name email')
      .populate('inspectionRequest', 'propertyLocation.address');
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">New Payment Receipt Uploaded - Action Required</h2>
        
        <p>A client has uploaded a payment receipt that requires verification.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Receipt Details</h3>
          <p><strong>Client:</strong> ${receiptData.client.name} (${receiptData.client.email})</p>
          <p><strong>Property:</strong> ${receiptData.inspectionRequest.propertyLocation.address}</p>
          <p><strong>Amount:</strong> $${receiptData.calculatedAmount}</p>
          <p><strong>Uploaded:</strong> ${receiptData.tokenUsedAt.toLocaleString()}</p>
          <p><strong>File:</strong> ${receiptData.originalFileName}</p>
        </div>
        
        <p><a href="${process.env.FRONTEND_URL}/finance/verify-receipt/${receiptData._id}" 
           style="background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
           Verify Payment Receipt
        </a></p>
        
        <p>Please review and verify this payment within 24-48 hours.</p>
      </div>
    `;
    
    // Send to all finance managers
    for (const manager of financeManagers) {
      await sendEmail({
        to: manager.email,
        subject: `Payment Receipt Verification Required - ${receiptData.client.name}`,
        html: emailHtml
      });
    }
    
  } catch (error) {
    console.error('Failed to notify finance manager:', error);
  }
}

// Helper: Notify client when payment is verified
async function notifyClientPaymentVerified(receipt) {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Payment Verified Successfully! 🎉</h2>
        
        <p>Dear ${receipt.client.name},</p>
        
        <p>Great news! Your payment has been successfully verified by our finance team.</p>
        
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #155724;">Next Steps</h3>
          <p>✅ Payment Verified: $${receipt.calculatedAmount}</p>
          <p>✅ Your inspection request is now active</p>
          <p>✅ Our team will assign an inspector within 24 hours</p>
          <p>✅ You'll receive scheduling details via email</p>
        </div>
        
        <p>You can track your inspection progress in your client dashboard.</p>
        
        <p>Thank you for choosing DesynFlow for your inspection needs!</p>
        
        <p>Best regards,<br>DesynFlow Team</p>
      </div>
    `;
    
    await sendEmail({
      to: receipt.client.email,
      subject: 'Payment Verified - Inspection Scheduling in Progress',
      html: emailHtml
    });
    
  } catch (error) {
    console.error('Failed to notify client of payment verification:', error);
  }
}

// Helper: Notify client when payment is rejected
async function notifyClientPaymentRejected(receipt) {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Payment Verification Issue</h2>
        
        <p>Dear ${receipt.client.name},</p>
        
        <p>We've reviewed your payment receipt, but unfortunately there's an issue that needs to be resolved.</p>
        
        <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #721c24;">Issue Details</h3>
          <p><strong>Reason:</strong> ${receipt.rejectionReason}</p>
          ${receipt.financeRemarks ? `<p><strong>Additional Notes:</strong> ${receipt.financeRemarks}</p>` : ''}
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">What to do next:</h3>
          <p>1. Check your payment receipt for the mentioned issues</p>
          <p>2. Contact our customer service team for clarification</p>
          <p>3. We can provide a new upload link if needed</p>
        </div>
        
        <p>Please contact us at your earliest convenience to resolve this matter.</p>
        
        <p>Best regards,<br>DesynFlow Customer Service</p>
      </div>
    `;
    
    await sendEmail({
      to: receipt.client.email,
      subject: 'Payment Verification Issue - Action Required',
      html: emailHtml
    });
    
  } catch (error) {
    console.error('Failed to notify client of payment rejection:', error);
  }
}

// Enhanced utility to verify one-time use token
async function verifyOneTimeToken(token, req) {
  const receipt = await PaymentReceipt.findOne({ uploadToken: token });
  
  if (!receipt) {
    throw new Error('Invalid upload link. This link may have been used or does not exist.');
  }
  
  if (receipt.isTokenUsed) {
    throw new Error('This upload link has already been used. Each link can only be used once for security.');
  }
  
  if (receipt.tokenExpires < new Date()) {
    // Mark as expired
    receipt.status = 'expired';
    await receipt.save();
    throw new Error('Upload link has expired. Please contact customer service for a new link.');
  }
  
  if (receipt.uploadAttempts >= 3) {
    throw new Error('Maximum upload attempts exceeded. Please contact customer service for assistance.');
  }
  
  if (receipt.status !== 'awaiting_upload') {
    throw new Error('Payment receipt has already been processed.');
  }
  
  // Increment attempt counter
  receipt.uploadAttempts += 1;
  await receipt.save();
  
  return receipt;
}

// Controller: Handle receipt upload via one-time secure link
export const uploadReceipt = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file uploaded. Please select a payment receipt file and try again.' 
      });
    }
    
    // Verify one-time token
    const receipt = await verifyOneTimeToken(token, req);
    
    // Mark token as used and save file details
    receipt.isTokenUsed = true;
    receipt.tokenUsedAt = new Date();
    receipt.receiptFilePath = req.file.path;
    receipt.originalFileName = req.file.originalname;
    receipt.fileSize = req.file.size;
    receipt.fileType = req.file.mimetype;
    receipt.status = 'uploaded';
    receipt.uploadIP = req.ip || req.connection.remoteAddress;
    receipt.uploadUserAgent = req.get('User-Agent') || '';
    
    await receipt.save();
    
    // Notify finance manager about new upload
    const FinanceNotificationService = (await import('../../../services/financeNotificationService.js')).default;
    await FinanceNotificationService.notifyReceiptUploaded(receipt._id);
    
    res.status(200).json({ 
      message: 'Payment receipt uploaded successfully! Finance team has been notified and will review your payment within 24-48 hours.',
      receiptId: receipt._id,
      uploadedAt: receipt.tokenUsedAt
    });
    
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Finance Manager: Verify or reject uploaded receipt
export const verifyPaymentReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { status, financeRemarks, rejectionReason } = req.body;
    const financeManagerId = req.user._id;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either "verified" or "rejected".' });
    }
    
    const receipt = await PaymentReceipt.findById(receiptId)
      .populate('client', 'name email')
      .populate('inspectionRequest', 'propertyLocation.address');
      
    if (!receipt) {
      return res.status(404).json({ message: 'Payment receipt not found.' });
    }
    
    if (receipt.status !== 'uploaded') {
      return res.status(400).json({ message: 'Receipt must be in "uploaded" status to verify.' });
    }
    
    // Update receipt status
    receipt.status = status;
    receipt.verifiedBy = financeManagerId;
    receipt.verifiedAt = new Date();
    receipt.financeRemarks = financeRemarks || '';
    
    if (status === 'rejected') {
      receipt.rejectionReason = rejectionReason || 'Payment verification failed';
    }
    
    await receipt.save();
    
    // Send notification email to client
    if (status === 'verified') {
      await notifyClientPaymentVerified(receipt);
      // Also update inspection request status
      await InspectionRequest.findByIdAndUpdate(receipt.inspectionRequest._id, {
        status: 'payment_verified'
      });
    } else {
      await notifyClientPaymentRejected(receipt);
    }
    
    res.status(200).json({ 
      message: `Payment receipt ${status} successfully`,
      receiptId: receipt._id,
      verifiedAt: receipt.verifiedAt,
      clientNotified: true
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get payment receipt status and details
export const getPaymentReceiptStatus = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const receipt = await PaymentReceipt.findById(receiptId)
      .populate('inspectionRequest', 'propertyLocation status')
      .populate('client', 'name email')
      .populate('verifiedBy', 'username role')
      .populate('emailSentBy', 'username');
      
    if (!receipt) {
      return res.status(404).json({ message: 'Payment receipt not found.' });
    }
    
    res.status(200).json({
      receiptId: receipt._id,
      status: receipt.status,
      calculatedAmount: receipt.calculatedAmount,
      paymentDueDate: receipt.paymentDueDate,
      isTokenValid: receipt.isTokenValid,
      uploadedAt: receipt.tokenUsedAt,
      verifiedAt: receipt.verifiedAt,
      verifiedBy: receipt.verifiedBy,
      financeRemarks: receipt.financeRemarks,
      rejectionReason: receipt.rejectionReason,
      uploadAttempts: receipt.uploadAttempts,
      emailSentAt: receipt.emailSentAt,
      client: receipt.client,
      inspectionRequest: receipt.inspectionRequest,
      createdAt: receipt.createdAt
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all payment receipts (for finance manager dashboard)
export const getAllPaymentReceipts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    const receipts = await PaymentReceipt.find(filter)
      .populate('client', 'name email')
      .populate('inspectionRequest', 'propertyLocation.address propertyType')
      .populate('verifiedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await PaymentReceipt.countDocuments(filter);
    
    res.status(200).json({
      receipts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalReceipts: total
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CSR: Generate one-time secure upload link with payment details
export const generatePaymentLinkForClient = async (req, res) => {
  try {
    const { inspectionRequestId, clientId, calculatedAmount, paymentDueDate } = req.body;
    const csrId = req.user._id; // CSR generating the link
    
    // Validate required fields
    if (!inspectionRequestId || !clientId || !calculatedAmount || !paymentDueDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: inspectionRequestId, clientId, calculatedAmount, paymentDueDate' 
      });
    }
    
    // Check if client and inspection request exist
    const [client, inspectionRequest] = await Promise.all([
      User.findById(clientId),
      InspectionRequest.findById(inspectionRequestId)
    ]);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }
    
    if (!inspectionRequest) {
      return res.status(404).json({ message: 'Inspection request not found.' });
    }
    
    // Check if payment link already exists and is valid
    const existingReceipt = await PaymentReceipt.findOne({
      inspectionRequest: inspectionRequestId,
      client: clientId,
      status: 'awaiting_upload'
    });
    
    if (existingReceipt && existingReceipt.isTokenValid) {
      return res.status(400).json({ 
        message: 'A valid payment link already exists for this request. Please use the existing link or wait for it to expire.' 
      });
    }
    
    // Generate secure one-time token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // 3 days to upload
    
    // Create payment receipt record
    const receipt = new PaymentReceipt({
      inspectionRequest: inspectionRequestId,
      client: clientId,
      calculatedAmount: calculatedAmount,
      paymentDueDate: new Date(paymentDueDate),
      uploadToken: token,
      tokenExpires: tokenExpires,
      status: 'awaiting_upload',
      emailSentBy: csrId
    });
    
    await receipt.save();
    
    // Generate upload URL
    const uploadUrl = `${req.protocol}://${req.get('host')}/api/payment-receipt/upload/${token}`;
    
    res.status(201).json({ 
      message: 'Payment link generated successfully',
      receiptId: receipt._id,
      uploadUrl: uploadUrl,
      tokenExpires: tokenExpires,
      calculatedAmount: calculatedAmount,
      paymentDueDate: paymentDueDate
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CSR: Send payment details and upload link via email
export const sendPaymentDetailsEmail = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const csrId = req.user._id;
    
    const receipt = await PaymentReceipt.findById(receiptId)
      .populate('client', 'name email')
      .populate('inspectionRequest', 'propertyLocation.address')
      .populate('emailSentBy', 'username');
    
    if (!receipt) {
      return res.status(404).json({ message: 'Payment receipt not found.' });
    }
    
    if (!receipt.isTokenValid) {
      return res.status(400).json({ message: 'Upload link is no longer valid.' });
    }
    
    const uploadUrl = `${req.protocol}://${req.get('host')}/api/payment-receipt/upload/${receipt.uploadToken}`;
    
    // Send email to client
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Payment Required - DesynFlow Inspection Service</h2>
        
        <p>Dear ${receipt.client.name},</p>
        
        <p>Thank you for submitting your inspection request. Our finance team has calculated the inspection cost based on your property details.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Payment Details</h3>
          <p><strong>Property:</strong> ${receipt.inspectionRequest.propertyLocation.address}</p>
          <p><strong>Inspection Cost:</strong> $${receipt.calculatedAmount}</p>
          <p><strong>Payment Due Date:</strong> ${receipt.paymentDueDate.toDateString()}</p>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
          <h3 style="margin-top: 0; color: #1976d2;">Secure Payment Receipt Upload</h3>
          <p>To upload your payment receipt, please click the secure link below:</p>
          <p><a href="${uploadUrl}" style="background: #2196f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Upload Payment Receipt</a></p>
          <p style="margin-top: 15px; font-size: 14px; color: #666;">
            <strong>Important Security Notes:</strong><br>
            • This link can only be used ONCE for security<br>
            • Link expires in 3 days<br>
            • Maximum file size: 5MB<br>
            • Accepted formats: JPG, PNG, PDF
          </p>
        </div>
        
        <p>Once you upload your payment receipt, our finance team will verify it within 24-48 hours and you'll receive confirmation.</p>
        
        <p>If you have any questions, please contact our customer service team.</p>
        
        <p>Best regards,<br>DesynFlow Customer Service Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `;
    
    await sendEmail({
      to: receipt.client.email,
      subject: `Payment Required - DesynFlow Inspection Service (Amount: $${receipt.calculatedAmount})`,
      html: emailHtml
    });
    
    // Update email sent timestamp
    receipt.emailSentAt = new Date();
    await receipt.save();
    
    res.status(200).json({ 
      message: 'Payment details email sent successfully to client',
      sentTo: receipt.client.email,
      sentAt: receipt.emailSentAt
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};