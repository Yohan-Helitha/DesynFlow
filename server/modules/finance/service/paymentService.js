import Payment from '../model/payment.js';
import { adjustBalance, incrementIncome, decrementIncome } from './financeSummaryService.js';
import QuotationEstimation from '../model/quotation_estimation.js';
import mongoose from 'mongoose';

// Get all payments
export async function getAllPayments() {
  return Payment.find();
}

// Get payments by single status
export async function getPaymentsByStatus(status) {
  // Pending: newest created first
  return Payment.find({ status })
    .sort({ createdAt: -1 })
    .populate({ path: 'projectId', select: 'projectName status location clientId' })
    .populate({ path: 'clientId', select: 'username name email phone phoneNumber' });
}

// Get payments by multiple statuses
export async function getPaymentsByStatuses(statuses) {
  // Reviewed set: latest updates first (review time reflected in updatedAt)
  return Payment.find({ status: { $in: statuses } })
    .sort({ updatedAt: -1 })
    .populate({ path: 'projectId', select: 'projectName status location clientId' })
    .populate({ path: 'clientId', select: 'username name email phone phoneNumber' });
}

// Approve or reject a payment
export async function updatePaymentStatus(paymentId, status, comment) {
  const prev = await Payment.findById(paymentId);
  if (!prev) throw new Error('Payment not found');
  const update = { status, updatedAt: new Date() };
  if (typeof comment !== 'undefined') update.comment = comment;
  const updated = await Payment.findByIdAndUpdate(paymentId, update, { new: true });
  // If transitioning to Approved (and wasn't already), add amount to totalIncome and totalBalance
  if (prev.status !== 'Approved' && updated.status === 'Approved') {
    await incrementIncome(updated.amount);
    await adjustBalance(updated.amount);
  }
  // If transitioning away from Approved, reverse from totalIncome and totalBalance
  if (prev.status === 'Approved' && updated.status !== 'Approved') {
    await decrementIncome(updated.amount);
    await adjustBalance(-updated.amount);
  }
  return updated;
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
  const match = {};
  if (clientId) match.clientId = mongoose.Types.ObjectId(clientId);
  if (projectId) match.projectId = mongoose.Types.ObjectId(projectId);

  const dueAgg = await QuotationEstimation.aggregate([
    { $match: match },
    { $group: { _id: null, totalDue: { $sum: '$total' } } },
  ]);
  const totalDue = dueAgg[0]?.totalDue || 0;

  const paidAgg = await Payment.aggregate([
    { $match: { ...match, status: 'Approved' } },
    { $group: { _id: null, totalPaid: { $sum: '$amount' } } },
  ]);
  const totalPaid = paidAgg[0]?.totalPaid || 0;

  return { totalDue, totalPaid, outstanding: totalDue - totalPaid };
}
