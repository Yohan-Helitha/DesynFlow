import { sendEmail } from '../utils/emailService.js';
import PaymentReceipt from '../modules/auth/model/paymentReceipt.model.js';
import User from '../modules/auth/model/user.model.js';

class FinanceNotificationService {
  // Notify finance managers when a new receipt is uploaded
  static async notifyReceiptUploaded(receiptId) {
    const financeManagers = await User.find({ role: 'finance manager' });
    if (!financeManagers.length) return { success: false, message: 'No finance managers found' };

    const receipt = await PaymentReceipt.findById(receiptId)
      .populate('client', 'name email')
      .populate('inspectionRequest', 'propertyLocation.address propertyType');

    if (!receipt) throw new Error('Payment receipt not found');

    const emailText = `
A new payment receipt has been uploaded.

Client: ${receipt.client.name} (${receipt.client.email})
Property: ${receipt.inspectionRequest.propertyLocation.address}
Type: ${receipt.inspectionRequest.propertyType}
Amount: $${receipt.calculatedAmount}
Due Date: ${receipt.paymentDueDate.toDateString()}

Please log in to the finance dashboard to verify.
    `;

    await Promise.all(
      financeManagers.map(manager =>
        sendEmail({
          to: manager.email,
          subject: `New Payment Receipt Uploaded - ${receipt.client.name}`,
          text: emailText,
        })
      )
    );

    return { success: true, notifiedManagers: financeManagers.length };
  }
}

export default FinanceNotificationService;
