import PaymentReceipt from '../model/paymentReceipt.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import User from '../model/user.model.js';
import { sendEmail } from '../../../utils/emailService.js';
import crypto from 'crypto';

// ===== Helper: Notify finance manager about new receipt upload =====
async function notifyFinanceManager(receipt) {
  try {
    const financeManagers = await User.find({ role: 'finance manager' });
    if (financeManagers.length === 0) return;

    const receiptData = await PaymentReceipt.findById(receipt._id)
      .populate('client', 'name email')
      .populate('inspectionRequest', 'propertyLocation.address');

    const emailHtml = `
      <h2>New Payment Receipt Uploaded</h2>
      <p>Client: ${receiptData.client.name} (${receiptData.client.email})</p>
      <p>Property: ${receiptData.inspectionRequest.propertyLocation.address}</p>
      <p>Amount: $${receiptData.calculatedAmount}</p>
      <p><a href="${process.env.FRONTEND_URL}/finance/verify-receipt/${receiptData._id}">Verify Receipt</a></p>
    `;

    for (const manager of financeManagers) {
      await sendEmail({
        to: manager.email,
        subject: `Payment Receipt Verification - ${receiptData.client.name}`,
        html: emailHtml
      });
    }
  } catch (error) {
    console.error('Notify finance failed:', error);
  }
}

// ===== Helper: Notify client payment verified =====
async function notifyClientPaymentVerified(receipt) {
  const emailHtml = `
    <h2>Payment Verified ✅</h2>
    <p>Dear ${receipt.client.name}, your payment of $${receipt.calculatedAmount} has been verified.</p>
    <p>Your inspection will now be scheduled.</p>
  `;

  await sendEmail({
    to: receipt.client.email,
    subject: 'Payment Verified - Inspection in Progress',
    html: emailHtml
  });
}

// ===== CONTROLLERS =====

// Upload receipt via secure link (Client)
export const uploadReceipt = async (req, res) => {
  try {
    const { token } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const receipt = await PaymentReceipt.findOne({ uploadToken: token });
    if (!receipt) return res.status(400).json({ message: 'Invalid or expired link' });

    if (receipt.tokenExpires < new Date()) {
      receipt.status = 'expired';
      await receipt.save();
      return res.status(400).json({ message: 'Upload link expired' });
    }

    if (receipt.status !== 'awaiting_upload') {
      return res.status(400).json({ message: 'Receipt already used' });
    }

    receipt.status = 'uploaded';
    receipt.receiptFilePath = req.file.path;
    receipt.tokenUsedAt = new Date();
    await receipt.save();

    await notifyFinanceManager(receipt);

    res.status(200).json({ message: 'Receipt uploaded, finance notified' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Finance manager verify receipt
export const verifyPaymentReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { status } = req.body;

    if (!['verified'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const receipt = await PaymentReceipt.findById(receiptId)
      .populate('client', 'name email')
      .populate('inspectionRequest');

    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    if (receipt.status !== 'uploaded') {
      return res.status(400).json({ message: 'Receipt must be uploaded first' });
    }

    receipt.status = 'verified';
    receipt.verifiedAt = new Date();
    await receipt.save();

    // Update linked inspection request
    await InspectionRequest.findByIdAndUpdate(receipt.inspectionRequest._id, {
      status: 'payment_verified'
    });

    await notifyClientPaymentVerified(receipt);

    res.json({ message: 'Receipt verified and client notified' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CSR: Generate one-time secure upload link
export const generatePaymentLinkForClient = async (req, res) => {
  try {
    const { inspectionRequestId, clientId, calculatedAmount, paymentDueDate } = req.body;
    const csrId = req.user._id;

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const receipt = new PaymentReceipt({
      inspectionRequest: inspectionRequestId,
      client: clientId,
      calculatedAmount,
      paymentDueDate,
      uploadToken: token,
      tokenExpires,
      status: 'awaiting_upload',
      emailSentBy: csrId
    });

    await receipt.save();

    const uploadUrl = `${req.protocol}://${req.get('host')}/api/payment-receipt/upload/${token}`;

    res.status(201).json({ message: 'Payment link created', uploadUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get receipt status (shared for CSR, Finance, Client)
export const getPaymentReceiptStatus = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const receipt = await PaymentReceipt.findById(receiptId)
      .populate('client', 'name email')
      .populate('inspectionRequest', 'propertyLocation status');

    if (!receipt) return res.status(404).json({ message: 'Not found' });

    res.json(receipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Delete a payment receipt (Admin only)
export const deletePaymentReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;

    const receipt = await PaymentReceipt.findById(receiptId);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    await PaymentReceipt.findByIdAndDelete(receiptId);

    res.status(200).json({ message: "Receipt deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
