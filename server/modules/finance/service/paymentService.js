// Get all payments
export async function getAllPayments() {
  return Payment.find();
}
import Payment from '../model/payment.js';
import QuotationEstimation from '../model/quotation_estimation.js';
import mongoose from 'mongoose';

// Get payments by single status
export async function getPaymentsByStatus(status) {
  return Payment.find({ status });
}

// Get payments by multiple statuses
export async function getPaymentsByStatuses(statuses) {
  return Payment.find({ status: { $in: statuses } });
}

// Approve or reject a payment
export async function updatePaymentStatus(paymentId, status, comment) {
  const update = { status };
  if (typeof comment !== 'undefined') update.comment = comment;
  return Payment.findByIdAndUpdate(paymentId, update, { new: true });
}

// Filter payments by project, client, date
export async function filterPayments({ projectId, clientId, fromDate, toDate }) {
  const filter = {};
  if (projectId) filter.projectId = projectId;
  if (clientId) filter.clientId = clientId;
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);
  }
  return Payment.find(filter);
}

// Calculate outstanding balances per client/project
export async function getOutstandingBalances({ clientId, projectId }) {
  // Aggregate total due from quotation_estimation and total paid from payments
  const match = {};
  if (clientId) match.clientId = mongoose.Types.ObjectId(clientId);
  if (projectId) match.projectId = mongoose.Types.ObjectId(projectId);

  // Get total due from quotations
  const dueAgg = await QuotationEstimation.aggregate([
    { $match: match },
    { $group: { _id: null, totalDue: { $sum: "$total" } } }
  ]);
  const totalDue = dueAgg[0]?.totalDue || 0;

  // Get total paid from payments
  const paidAgg = await Payment.aggregate([
    { $match: { ...match, status: 'Approved' } },
    { $group: { _id: null, totalPaid: { $sum: "$amount" } } }
  ]);
  const totalPaid = paidAgg[0]?.totalPaid || 0;

  return { totalDue, totalPaid, outstanding: totalDue - totalPaid };
}
