import * as paymentService from '../service/paymentService.js';

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
    const { status } = req.body; // 'Approved' or 'Rejected'
    const payment = await paymentService.updatePaymentStatus(paymentId, status);
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
