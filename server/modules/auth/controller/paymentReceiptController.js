import PaymentReceipt from '../model/paymentReceipt.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import User from '../model/user.model.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Utility to verify token and expiration
async function verifyUploadToken(token) {
  const receipt = await PaymentReceipt.findOne({ uploadToken: token });
  if (!receipt) throw new Error('Invalid or expired link.');
  if (receipt.tokenExpires < Date.now()) throw new Error('Link has expired.');
  return receipt;
}

// Controller: Handle receipt upload via secure link
export const uploadReceipt = async (req, res) => {
  try {
    const { token } = req.params;
    // Assume file is uploaded via multipart/form-data as 'receiptFile'
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const receipt = await verifyUploadToken(token);
    // Save file path and update status
    receipt.receiptFilePath = req.file.path;
    receipt.status = 'pending';
    await receipt.save();
    res.status(200).json({ message: 'Receipt uploaded successfully. Awaiting verification.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller: Finance/admin verifies or rejects receipt
export const verifyReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { status, remarks } = req.body; // status: 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const receipt = await PaymentReceipt.findById(receiptId);
    if (!receipt) return res.status(404).json({ message: 'Receipt not found.' });
    receipt.status = status;
    receipt.remarks = remarks || '';
    receipt.verifiedBy = req.user ? req.user._id : null;
    receipt.verifiedAt = new Date();
    await receipt.save();
    res.status(200).json({ message: `Receipt ${status}.` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller: Get receipt status (for client or admin)
export const getReceiptStatus = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const receipt = await PaymentReceipt.findById(receiptId)
      .populate('inspectionRequest')
      .populate('client', 'name email');
    if (!receipt) return res.status(404).json({ message: 'Receipt not found.' });
    res.status(200).json(receipt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller: Generate a secure upload link (token) for a client
export const generateUploadLink = async (req, res) => {
  try {
    const { inspectionRequestId, clientId } = req.body;
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours
    // Create a new PaymentReceipt record
    const receipt = new PaymentReceipt({
      inspectionRequest: inspectionRequestId,
      client: clientId,
      receiptFilePath: '',
      status: 'pending',
      uploadToken: token,
      tokenExpires
    });
    await receipt.save();
    // Construct upload URL (adjust base URL as needed)
    const uploadUrl = `${req.protocol}://${req.get('host')}/api/payment-receipt/upload/${token}`;
    res.status(201).json({ uploadUrl, receiptId: receipt._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};