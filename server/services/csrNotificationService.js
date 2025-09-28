import { sendEmail } from '../utils/emailService.js';
import PaymentReceipt from '../modules/auth/model/paymentReceipt.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import User from '../modules/auth/model/user.model.js';

class CSRNotificationService {
  // Send client payment request with one-time upload link
  static async sendPaymentRequest(inspectionRequestId, calculatedAmount, paymentDueDate, csrId) {
    const inspectionRequest = await InspectionRequest.findById(inspectionRequestId)
      .populate('client', 'name email');

    if (!inspectionRequest) throw new Error('Inspection request not found');
    const client = inspectionRequest.client;

    // Create payment receipt record
    const receipt = new PaymentReceipt({
      inspectionRequest: inspectionRequestId,
      client: client._id,
      calculatedAmount,
      paymentDueDate: new Date(paymentDueDate),
      tokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
      status: 'awaiting_upload',
      emailSentBy: csrId,
    });
    await receipt.save();

    const uploadUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/payment-receipt/upload/${receipt.uploadToken}`;

    // Send plain email to client
    await sendEmail({
      to: client.email,
      subject: `Payment Required - Inspection Service ($${calculatedAmount})`,
      text: `
Hello ${client.name},

Thank you for your inspection request.
The inspection cost is $${calculatedAmount}.
please do the payment :- A/C no: 123456789, Bank: XYZ Bank.
Payment is due by: ${receipt.paymentDueDate.toDateString()}.

Please upload your payment receipt using this link: 
(Attention: This link can only be used once- one-time secure link:)
${uploadUrl}

This link will expire on: ${receipt.tokenExpires.toDateString()}.

- DesynFlow CSR Team
      `,
    });

    receipt.emailSentAt = new Date();
    await receipt.save();

    return { success: true, receiptId: receipt._id, uploadUrl };
  }

  // Notify client after finance verifies payment
  static async notifyPaymentVerified(receiptId) {
    const receipt = await PaymentReceipt.findById(receiptId)
      .populate('client', 'name email')
      .populate('inspectionRequest', 'propertyLocation.address');

    if (!receipt) throw new Error('Payment receipt not found');

    await sendEmail({
      to: receipt.client.email,
      subject: 'Payment Verified - Inspection in Progress',
      text: `
Hello ${receipt.client.name},

Your payment of $${receipt.calculatedAmount} has been verified.
Inspection for your property at ${receipt.inspectionRequest.propertyLocation.address} is now in progress.
We will contact you with scheduling details soon.

- DesynFlow CSR Team
      `,
    });

    return { success: true, sentTo: receipt.client.email };
  }
}

export default CSRNotificationService;
