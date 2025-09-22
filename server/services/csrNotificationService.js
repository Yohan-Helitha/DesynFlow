import { sendEmail } from '../utils/emailService.js';
import PaymentReceipt from '../modules/auth/model/paymentReceipt.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import User from '../modules/auth/model/user.model.js';

class CSRNotificationService {
  
  // Generate and send payment details to client
  static async sendPaymentRequest(inspectionRequestId, calculatedAmount, paymentDueDate, csrId) {
    try {
      // Get inspection request and client details
      const inspectionRequest = await InspectionRequest.findById(inspectionRequestId)
        .populate('client', 'name email phone');
        
      if (!inspectionRequest) {
        throw new Error('Inspection request not found');
      }
      
      const client = inspectionRequest.client;
      
      // Generate one-time payment receipt record
      const receipt = new PaymentReceipt({
        inspectionRequest: inspectionRequestId,
        client: client._id,
        calculatedAmount: calculatedAmount,
        paymentDueDate: new Date(paymentDueDate),
        tokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
        status: 'awaiting_upload',
        emailSentBy: csrId
      });
      
      await receipt.save();
      
      // Generate secure upload URL
      const uploadUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/payment-receipt/upload/${receipt.uploadToken}`;
      
      // Send payment email to client
      const emailHtml = this.generatePaymentEmailTemplate(client, inspectionRequest, receipt, uploadUrl);
      
      await sendEmail({
        to: client.email,
        subject: `Payment Required - DesynFlow Inspection Service (Amount: $${calculatedAmount})`,
        html: emailHtml
      });
      
      // Update email sent timestamp
      receipt.emailSentAt = new Date();
      await receipt.save();
      
      return {
        success: true,
        receiptId: receipt._id,
        uploadUrl: uploadUrl,
        sentTo: client.email,
        expiresAt: receipt.tokenExpires
      };
      
    } catch (error) {
      throw new Error(`Failed to send payment request: ${error.message}`);
    }
  }
  
  // Generate payment email template
  static generatePaymentEmailTemplate(client, inspectionRequest, receipt, uploadUrl) {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">🏠 DesynFlow</h1>
          <p style="color: #f8f9fa; margin: 10px 0 0 0; font-size: 16px;">Professional Inspection Services</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 24px;">Payment Required for Inspection Service</h2>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Dear ${client.name},</p>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Thank you for submitting your inspection request. Our finance team has calculated the inspection cost based on your property details and requirements.
          </p>
          
          <!-- Property Details Card -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #3498db;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px;">📋 Inspection Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #7f8c8d; font-weight: 600;">Property Address:</td>
                <td style="padding: 8px 0; color: #2c3e50;">${inspectionRequest.propertyLocation?.address || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7f8c8d; font-weight: 600;">Property Type:</td>
                <td style="padding: 8px 0; color: #2c3e50;">${inspectionRequest.propertyType || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7f8c8d; font-weight: 600;">Number of Floors:</td>
                <td style="padding: 8px 0; color: #2c3e50;">${inspectionRequest.numberOfFloors || 'N/A'}</td>
              </tr>
            </table>
          </div>
          
          <!-- Payment Details Card -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; color: white;">
            <h3 style="margin: 0 0 15px 0; color: white; font-size: 18px;">💳 Payment Information</h3>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 16px;">Inspection Cost:</span>
              <span style="font-size: 24px; font-weight: bold;">$${receipt.calculatedAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px;">Payment Due Date:</span>
              <span style="font-size: 16px; font-weight: 600;">${receipt.paymentDueDate.toDateString()}</span>
            </div>
          </div>
          
          <!-- Secure Upload Section -->
          <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; border: 2px dashed #27ae60; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #27ae60; font-size: 18px;">🔒 Secure Payment Receipt Upload</h3>
            <p style="color: #2d5a2d; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              For your security, we use encrypted one-time upload links. Click the button below to securely upload your payment receipt:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${uploadUrl}" 
                 style="background: linear-gradient(135deg, #27ae60, #2ecc71); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 50px; 
                        display: inline-block; 
                        font-size: 16px; 
                        font-weight: 600;
                        box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
                        transition: all 0.3s ease;">
                📤 Upload Payment Receipt Securely
              </a>
            </div>
            
            <!-- Security Notes -->
            <div style="background: #fff; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f39c12;">
              <h4 style="margin: 0 0 10px 0; color: #e67e22; font-size: 16px;">🛡️ Security Features</h4>
              <ul style="color: #2c3e50; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>One-time use only - link becomes invalid after upload</li>
                <li>Expires in 3 days (${receipt.tokenExpires.toDateString()})</li>
                <li>Encrypted connection for secure file transfer</li>
                <li>Maximum file size: 5MB</li>
                <li>Accepted formats: JPG, PNG, PDF</li>
                <li>Maximum 3 upload attempts for security</li>
              </ul>
            </div>
          </div>
          
          <!-- Process Timeline -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 18px;">📅 What Happens Next</h3>
            <div style="position: relative;">
              <div style="margin-bottom: 15px; padding-left: 30px; position: relative;">
                <div style="position: absolute; left: 0; top: 5px; width: 20px; height: 20px; background: #3498db; border-radius: 50%; color: white; text-align: center; line-height: 20px; font-size: 12px; font-weight: bold;">1</div>
                <strong style="color: #2c3e50;">Upload Payment Receipt</strong><br>
                <span style="color: #7f8c8d; font-size: 14px;">Use the secure link above</span>
              </div>
              <div style="margin-bottom: 15px; padding-left: 30px; position: relative;">
                <div style="position: absolute; left: 0; top: 5px; width: 20px; height: 20px; background: #f39c12; border-radius: 50%; color: white; text-align: center; line-height: 20px; font-size: 12px; font-weight: bold;">2</div>
                <strong style="color: #2c3e50;">Finance Verification</strong><br>
                <span style="color: #7f8c8d; font-size: 14px;">24-48 hours review period</span>
              </div>
              <div style="margin-bottom: 15px; padding-left: 30px; position: relative;">
                <div style="position: absolute; left: 0; top: 5px; width: 20px; height: 20px; background: #27ae60; border-radius: 50%; color: white; text-align: center; line-height: 20px; font-size: 12px; font-weight: bold;">3</div>
                <strong style="color: #2c3e50;">Inspector Assignment</strong><br>
                <span style="color: #7f8c8d; font-size: 14px;">Qualified inspector assigned to your property</span>
              </div>
              <div style="padding-left: 30px; position: relative;">
                <div style="position: absolute; left: 0; top: 5px; width: 20px; height: 20px; background: #9b59b6; border-radius: 50%; color: white; text-align: center; line-height: 20px; font-size: 12px; font-weight: bold;">4</div>
                <strong style="color: #2c3e50;">Inspection Scheduled</strong><br>
                <span style="color: #7f8c8d; font-size: 14px;">Receive scheduling details and confirmation</span>
              </div>
            </div>
          </div>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            If you have any questions or need assistance with the payment process, please don't hesitate to contact our customer service team.
          </p>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Best regards,<br>
            <strong>DesynFlow Customer Service Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #2c3e50; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #95a5a6; font-size: 14px; margin: 0;">
            This is an automated email from DesynFlow. Please do not reply to this message.
          </p>
          <p style="color: #95a5a6; font-size: 12px; margin: 10px 0 0 0;">
            © 2025 DesynFlow. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }
  
  // Notify client when payment is verified (called by Finance Manager)
  static async notifyPaymentVerified(receiptId) {
    try {
      const receipt = await PaymentReceipt.findById(receiptId)
        .populate('client', 'name email')
        .populate('inspectionRequest', 'propertyLocation.address propertyType');
        
      if (!receipt) {
        throw new Error('Payment receipt not found');
      }
      
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff;">
          <!-- Success Header -->
          <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300;">🎉 Payment Verified!</h1>
            <p style="color: #d5f4e6; margin: 15px 0 0 0; font-size: 18px;">Your inspection is now being processed</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 24px;">Great News, ${receipt.client.name}!</h2>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
              Your payment has been successfully verified by our finance team. Your inspection request is now active and being processed.
            </p>
            
            <!-- Verification Details -->
            <div style="background: #d4edda; padding: 25px; border-radius: 10px; border-left: 5px solid #27ae60; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #155724; font-size: 18px;">✅ Verification Complete</h3>
              <p style="color: #155724; margin: 5px 0;"><strong>Amount Verified:</strong> $${receipt.calculatedAmount}</p>
              <p style="color: #155724; margin: 5px 0;"><strong>Property:</strong> ${receipt.inspectionRequest.propertyLocation.address}</p>
              <p style="color: #155724; margin: 5px 0;"><strong>Verified On:</strong> ${receipt.verifiedAt.toDateString()}</p>
            </div>
            
            <!-- Next Steps -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
              <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 18px;">🚀 What Happens Next</h3>
              <ul style="color: #34495e; font-size: 16px; line-height: 1.8; padding-left: 20px;">
                <li>Our team will assign a qualified inspector within 24 hours</li>
                <li>You'll receive scheduling details and inspector contact information</li>
                <li>The inspector will coordinate with you for a convenient inspection time</li>
                <li>After inspection, you'll receive a comprehensive report</li>
              </ul>
            </div>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
              You can track your inspection progress in your client dashboard. We'll keep you updated throughout the process.
            </p>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
              Thank you for choosing DesynFlow for your property inspection needs!
            </p>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
              Best regards,<br>
              <strong>The DesynFlow Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #2c3e50; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #95a5a6; font-size: 14px; margin: 0;">
              Questions? Contact our support team anytime.
            </p>
          </div>
        </div>
      `;
      
      await sendEmail({
        to: receipt.client.email,
        subject: '🎉 Payment Verified - Inspection Scheduling in Progress',
        html: emailHtml
      });
      
      return { success: true, sentTo: receipt.client.email };
      
    } catch (error) {
      throw new Error(`Failed to notify payment verification: ${error.message}`);
    }
  }
}

export default CSRNotificationService;