import { sendEmail } from '../utils/emailService.js';
import Report from '../modules/auth/model/report.model.js';
import InspectionRequest from '../modules/auth/model/inspectionRequest.model.js';
import User from '../modules/auth/model/user.model.js';

class ProjectManagerNotificationService {
  // Notify project managers when a new inspection report is generated
  static async notifyReportGenerated(reportId) {
    try {
      const projectManagers = await User.find({ role: 'project manager' });
      if (!projectManagers.length) {
        return { success: false, message: 'No project managers found' };
      }

      const report = await Report.findById(reportId)
        .populate('inspector_ID', 'username email')
        .populate('InspectionRequest_ID', 'client_name propertyLocation propertyType');

      if (!report) throw new Error('Report not found');

      const emailHtml = `
        <h2>🔍 New Inspection Report Generated</h2>
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background-color: #f9f9f9;">
          <h3>Report Details:</h3>
          <p><strong>Report ID:</strong> ${report._id}</p>
          <p><strong>Inspector:</strong> ${report.inspector_ID.username} (${report.inspector_ID.email})</p>
          <p><strong>Client:</strong> ${report.InspectionRequest_ID.client_name}</p>
          <p><strong>Property Type:</strong> ${report.InspectionRequest_ID.propertyType}</p>
          <p><strong>Property Location:</strong> ${report.propertyLocation}</p>
          <p><strong>Inspection Date:</strong> ${new Date(report.inspection_Date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${report.validation_status}</p>
        </div>
        
        <h3>Report Content:</h3>
        <div style="border: 1px solid #ccc; padding: 10px; background-color: #fff; margin: 10px 0;">
          ${report.report_content || 'No content provided'}
        </div>
        
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/project-manager/reports/${report._id}" 
             style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            View Full Report
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Please review this report and provide feedback if necessary.
        </p>
        
        <hr>
        <p style="font-size: 12px; color: #999;">
          This is an automated notification from DesynFlow Inspection System.
        </p>
      `;

      // Send email to all project managers
      const notifications = await Promise.all(
        projectManagers.map(manager =>
          sendEmail({
            to: manager.email,
            subject: `New Inspection Report - ${report.InspectionRequest_ID.client_name} Property`,
            html: emailHtml
          }).catch(error => {
            console.error(`Failed to send email to ${manager.email}:`, error);
            return { error: error.message };
          })
        )
      );

      return { 
        success: true, 
        notifiedManagers: projectManagers.length,
        reportId,
        managerEmails: projectManagers.map(m => m.email)
      };

    } catch (error) {
      console.error('Project Manager notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify project managers when a report status changes (approved/rejected)
  static async notifyReportStatusChanged(reportId, newStatus, remarks = '') {
    try {
      const projectManagers = await User.find({ role: 'project manager' });
      if (!projectManagers.length) return { success: false, message: 'No project managers found' };

      const report = await Report.findById(reportId)
        .populate('inspector_ID', 'username email')
        .populate('InspectionRequest_ID', 'client_name propertyType');

      if (!report) throw new Error('Report not found');

      const statusColor = newStatus === 'approved' ? '#28a745' : '#dc3545';
      const statusIcon = newStatus === 'approved' ? '✅' : '❌';

      const emailHtml = `
        <h2>${statusIcon} Report Status Updated: ${newStatus.toUpperCase()}</h2>
        
        <div style="border: 1px solid ${statusColor}; padding: 15px; border-radius: 8px; background-color: #f8f9fa;">
          <h3>Report Details:</h3>
          <p><strong>Report ID:</strong> ${report._id}</p>
          <p><strong>Inspector:</strong> ${report.inspector_ID.username}</p>
          <p><strong>Client:</strong> ${report.InspectionRequest_ID.client_name}</p>
          <p><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
          ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
        </div>
        
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/project-manager/reports/${report._id}" 
             style="background-color: ${statusColor}; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            View Report Details
          </a>
        </p>
      `;

      await Promise.all(
        projectManagers.map(manager =>
          sendEmail({
            to: manager.email,
            subject: `Report ${newStatus.toUpperCase()} - ${report.InspectionRequest_ID.client_name}`,
            html: emailHtml
          })
        )
      );

      return { success: true, notifiedManagers: projectManagers.length };

    } catch (error) {
      console.error('Status change notification failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ProjectManagerNotificationService;