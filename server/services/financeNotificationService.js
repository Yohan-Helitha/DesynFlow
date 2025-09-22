import { sendEmail } from '../utils/emailService.js';
import PaymentReceipt from '../modules/auth/model/paymentReceipt.model.js';
import User from '../modules/auth/model/user.model.js';

class FinanceNotificationService {
  
  // Notify finance managers when a new receipt is uploaded
  static async notifyReceiptUploaded(receiptId) {
    try {
      // Get finance managers
      const financeManagers = await User.find({ role: 'finance manager' });
      
      if (financeManagers.length === 0) {
        console.warn('No finance managers found to notify');
        return { success: false, message: 'No finance managers found' };
      }
      
      // Get receipt details
      const receipt = await PaymentReceipt.findById(receiptId)
        .populate('client', 'name email phone')
        .populate('inspectionRequest', 'propertyLocation.address propertyType numberOfFloors')
        .populate('emailSentBy', 'username email');
      
      if (!receipt) {
        throw new Error('Payment receipt not found');
      }
      
      const emailHtml = this.generateReceiptNotificationEmail(receipt);
      
      // Send notification to all finance managers
      const emailPromises = financeManagers.map(manager => 
        sendEmail({
          to: manager.email,
          subject: `🔔 Payment Receipt Verification Required - ${receipt.client.name}`,
          html: emailHtml
        })
      );
      
      await Promise.all(emailPromises);
      
      return {
        success: true,
        notifiedManagers: financeManagers.length,
        receiptId: receiptId
      };
      
    } catch (error) {
      console.error('Failed to notify finance managers:', error);
      throw new Error(`Finance notification failed: ${error.message}`);
    }
  }
  
  // Generate email template for finance managers
  static generateReceiptNotificationEmail(receipt) {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/finance/verify-receipt/${receipt._id}`;
    
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background: #ffffff;">
        <!-- Urgent Header -->
        <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">⚡ Action Required</h1>
          <p style="color: #f8d7da; margin: 10px 0 0 0; font-size: 16px;">Payment Receipt Verification Needed</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 30px;">
          <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 22px;">New Payment Receipt Uploaded</h2>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            A client has uploaded their payment receipt and is awaiting verification. Please review and process this payment as soon as possible.
          </p>
          
          <!-- Priority Alert -->
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">⏰ Priority: High</h3>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              Client is waiting for verification to proceed with inspection scheduling.
              Target response time: 24 hours
            </p>
          </div>
          
          <!-- Client & Receipt Details -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 18px;">📋 Receipt Details</h3>
            
            <!-- Client Information -->
            <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #dee2e6;">
              <h4 style="margin: 0 0 10px 0; color: #495057; font-size: 16px;">Client Information</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-weight: 600; width: 140px;">Name:</td>
                  <td style="padding: 5px 0; color: #2c3e50; font-weight: 600;">${receipt.client.name}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-weight: 600;">Email:</td>
                  <td style="padding: 5px 0; color: #2c3e50;">${receipt.client.email}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-weight: 600;">Phone:</td>
                  <td style="padding: 5px 0; color: #2c3e50;">${receipt.client.phone || 'N/A'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Property Information -->
            <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #dee2e6;">
              <h4 style="margin: 0 0 10px 0; color: #495057; font-size: 16px;">Property Information</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-weight: 600; width: 140px;">Address:</td>
                  <td style="padding: 5px 0; color: #2c3e50;">${receipt.inspectionRequest.propertyLocation.address}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-weight: 600;">Type:</td>
                  <td style="padding: 5px 0; color: #2c3e50;">${receipt.inspectionRequest.propertyType}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-weight: 600;">Floors:</td>
                  <td style="padding: 5px 0; color: #2c3e50;">${receipt.inspectionRequest.numberOfFloors}</td>
                </tr>
              </table>
            </div>
            
            <!-- Payment Information -->
            <div>
              <h4 style="margin: 0 0 10px 0; color: #495057; font-size: 16px;">Payment Information</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: 600; width: 140px;">Amount:</td>
                  <td style="padding: 8px 0; color: #e74c3c; font-weight: bold; font-size: 18px;">$${receipt.calculatedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-weight: 600;">Due Date:</td>
                  <td style="padding: 5px 0; color: #2c3e50;">${receipt.paymentDueDate.toDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-weight: 600;">Uploaded:</td>
                  <td style="padding: 5px 0; color: #2c3e50;">${receipt.tokenUsedAt.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-weight: 600;">File:</td>
                  <td style="padding: 5px 0; color: #2c3e50;">${receipt.originalFileName} (${(receipt.fileSize / 1024 / 1024).toFixed(2)} MB)</td>
                </tr>
              </table>
            </div>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background: linear-gradient(135deg, #e74c3c, #c0392b); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 50px; 
                      display: inline-block; 
                      font-size: 16px; 
                      font-weight: 600;
                      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
                      transition: all 0.3s ease;">
              🔍 Verify Payment Receipt Now
            </a>
          </div>
          
          <!-- Verification Guidelines -->
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; margin: 20px 0;">
            <h4 style="margin: 0 0 15px 0; color: #1976d2; font-size: 16px;">📝 Verification Checklist</h4>
            <ul style="color: #1565c0; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Verify payment amount matches calculated cost ($${receipt.calculatedAmount})</li>
              <li>Check payment date is within due date (${receipt.paymentDueDate.toDateString()})</li>
              <li>Confirm payment method and transaction details are clear</li>
              <li>Validate receipt is genuine and not altered</li>
              <li>Ensure payment is made to correct DesynFlow account</li>
            </ul>
          </div>
          
          <!-- Process Information -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 15px 0; color: #495057; font-size: 16px;">⚙️ Process Information</h4>
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              <strong>Request processed by CSR:</strong> ${receipt.emailSentBy?.username || 'N/A'}<br>
              <strong>Upload method:</strong> Secure one-time link (token-based)<br>
              <strong>Security status:</strong> Link used and expired automatically<br>
              <strong>Client notification:</strong> Automatic notification will be sent upon your verification
            </p>
          </div>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Please review and process this payment verification as soon as possible. The client will be automatically notified of your decision.
          </p>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Best regards,<br>
            <strong>DesynFlow System</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #2c3e50; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #95a5a6; font-size: 13px; margin: 0;">
            This is an automated notification from DesynFlow Finance System
          </p>
          <p style="color: #95a5a6; font-size: 12px; margin: 5px 0 0 0;">
            Receipt ID: ${receipt._id} | Upload Time: ${receipt.tokenUsedAt.toLocaleString()}
          </p>
        </div>
      </div>
    `;
  }
  
  // Send daily summary of pending receipts
  static async sendDailySummary() {
    try {
      const pendingReceipts = await PaymentReceipt.find({ status: 'uploaded' })
        .populate('client', 'name email')
        .populate('inspectionRequest', 'propertyLocation.address propertyType')
        .sort({ tokenUsedAt: -1 });
      
      if (pendingReceipts.length === 0) {
        return { success: true, message: 'No pending receipts to report' };
      }
      
      const financeManagers = await User.find({ role: 'finance manager' });
      
      if (financeManagers.length === 0) {
        return { success: false, message: 'No finance managers found' };
      }
      
      const summaryHtml = this.generateDailySummaryEmail(pendingReceipts);
      
      const emailPromises = financeManagers.map(manager =>
        sendEmail({
          to: manager.email,
          subject: `📊 Daily Summary: ${pendingReceipts.length} Payment Receipts Pending Verification`,
          html: summaryHtml
        })
      );
      
      await Promise.all(emailPromises);
      
      return {
        success: true,
        pendingCount: pendingReceipts.length,
        notifiedManagers: financeManagers.length
      };
      
    } catch (error) {
      throw new Error(`Failed to send daily summary: ${error.message}`);
    }
  }
  
  // Generate daily summary email template
  static generateDailySummaryEmail(pendingReceipts) {
    const totalAmount = pendingReceipts.reduce((sum, receipt) => sum + receipt.calculatedAmount, 0);
    
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3498db, #2980b9); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">📊 Daily Finance Summary</h1>
          <p style="color: #d6eaf8; margin: 10px 0 0 0; font-size: 16px;">${new Date().toDateString()}</p>
        </div>
        
        <!-- Summary Stats -->
        <div style="padding: 30px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Payment Receipts Awaiting Verification</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 16px; color: #495057;">Total Pending:</span>
              <span style="font-size: 20px; font-weight: bold; color: #e74c3c;">${pendingReceipts.length} receipts</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 16px; color: #495057;">Total Amount:</span>
              <span style="font-size: 20px; font-weight: bold; color: #27ae60;">$${totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <!-- Receipt List -->
          <h3 style="color: #2c3e50; margin-bottom: 20px;">Recent Uploads Requiring Attention</h3>
          ${pendingReceipts.slice(0, 10).map((receipt, index) => `
            <div style="background: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'}; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #e74c3c;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #2c3e50;">${receipt.client.name}</strong><br>
                  <span style="color: #6c757d; font-size: 14px;">${receipt.inspectionRequest.propertyLocation.address}</span><br>
                  <span style="color: #6c757d; font-size: 12px;">Uploaded: ${receipt.tokenUsedAt.toLocaleDateString()}</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 18px; font-weight: bold; color: #e74c3c;">$${receipt.calculatedAmount}</span><br>
                  <span style="font-size: 12px; color: #6c757d;">${receipt.inspectionRequest.propertyType}</span>
                </div>
              </div>
            </div>
          `).join('')}
          
          ${pendingReceipts.length > 10 ? `
            <div style="text-align: center; margin: 20px 0; color: #6c757d;">
              ... and ${pendingReceipts.length - 10} more receipts awaiting verification
            </div>
          ` : ''}
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/finance/dashboard" 
               style="background: linear-gradient(135deg, #3498db, #2980b9); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 50px; 
                      display: inline-block; 
                      font-size: 16px; 
                      font-weight: 600;">
              🏢 Open Finance Dashboard
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #2c3e50; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #95a5a6; font-size: 13px; margin: 0;">
            DesynFlow Finance Daily Summary | ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;
  }
}

export default FinanceNotificationService;