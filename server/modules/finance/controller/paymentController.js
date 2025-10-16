// Get all payments
export async function getAllPayments(req, res) {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
import * as paymentService from '../service/paymentService.js';
import User from '../../auth/model/user.model.js';
import { sendEmail } from '../../../utils/emailService.js';
import * as notificationService from '../service/financeNotificationService.js';
import Project from '../../project/model/project.model.js';

// Display all pending payments
export async function getPendingPayments(req, res) {
  try {
    const payments = await paymentService.getPaymentsByStatus('Pending');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Display all approved or rejected payments
export async function getProcessedPayments(req, res) {
  try {
    const payments = await paymentService.getPaymentsByStatuses(['Approved', 'Rejected']);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Approve or reject a pending payment
export async function updatePaymentStatus(req, res) {
  try {
    const { paymentId } = req.params;
    const { status, comment } = req.body; // 'Approved' or 'Rejected', and comment
    const payment = await paymentService.updatePaymentStatus(paymentId, status, comment);

    // Populate related data for notifications
    const populatedPayment = await paymentService.getPaymentsByStatus('Approved').then(payments => 
      payments.find(p => p._id.toString() === paymentId)
    );
    
    const client = populatedPayment?.clientId || await User.findById(payment.clientId);
    const project = populatedPayment?.projectId || await Project.findById(payment.projectId);

    // Create notifications
    if (status === 'Approved') {
      // Notify client
      if (client) {
        await notificationService.createNotification({
          userId: client._id,
          eventType: 'payment_approved',
          title: 'Payment Approved',
          message: `Your payment of LKR ${payment.amount} has been approved.`,
          relatedEntity: {
            entityType: 'Payment',
            entityId: payment._id
          },
          metadata: {
            amount: payment.amount,
            projectName: project?.projectName || 'Unknown Project'
          },
          priority: 'high'
        });
      }
      
      // Notify finance managers
      await notificationService.notifyFinanceManagers({
        eventType: 'payment_approved',
        title: 'Payment Approved',
        message: `Payment of LKR ${payment.amount} from ${client?.username || 'client'} has been approved.`,
        relatedEntity: {
          entityType: 'Payment',
          entityId: payment._id
        },
        metadata: {
          amount: payment.amount,
          clientName: client?.username,
          projectName: project?.projectName
        }
      });

      // Send email to client
      if (client && client.email) {
        const html = `<h2>Payment Approved</h2>
          <p>Dear ${client.username || 'User'},</p>
          <p>Your payment of <b>LKR ${payment.amount}</b> for your project has been <b>approved</b>.</p>
          <p>Thank you for your payment. You may now proceed with the next steps in your project.</p>
          <br><p>Best regards,<br>DesynFlow Finance Team</p>`;
        try {
          await sendEmail({
            to: client.email,
            subject: 'Your Payment Has Been Approved',
            html
          });
        } catch (emailErr) {
          console.error('Failed to send payment approval email:', emailErr);
        }
      }
    } else if (status === 'Rejected') {
      // Notify client
      if (client) {
        await notificationService.createNotification({
          userId: client._id,
          eventType: 'payment_rejected',
          title: 'Payment Rejected',
          message: `Your payment of LKR ${payment.amount} has been rejected. ${comment ? 'Reason: ' + comment : ''}`,
          relatedEntity: {
            entityType: 'Payment',
            entityId: payment._id
          },
          metadata: {
            amount: payment.amount,
            projectName: project?.projectName || 'Unknown Project',
            comment
          },
          priority: 'high'
        });
      }
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Filter payments by project, client, date
export async function filterPayments(req, res) {
  try {
    const { projectId, clientId, fromDate, toDate } = req.query;
    const payments = await paymentService.filterPayments({ projectId, clientId, fromDate, toDate });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Calculate outstanding balances per client/project
export async function getOutstandingBalances(req, res) {
  try {
    const { clientId, projectId } = req.query;
    const balances = await paymentService.getOutstandingBalances({ clientId, projectId });
    res.json(balances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
