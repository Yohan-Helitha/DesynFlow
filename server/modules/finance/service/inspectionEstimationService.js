import InspectionEstimation from '../model/inspection_estimation.js';
import InspectionRequest from '../../auth/model/inspectionRequest.model.js';
import { adjustBalance, incrementIncome, decrementIncome } from './financeSummaryService.js';


// Get requests with status 'PaymentPending' and join estimation data
export async function getPaymentPendingWithEstimation() {
  // For finance 'Pending Payments' view: show items where client uploaded a receipt
  const ests = await InspectionEstimation.find({ paymentStatus: 'uploaded' }).lean();
  if (!ests.length) return [];
  const requestIds = ests.map(e => String(e.inspectionRequestId)).filter(Boolean);
  const reqs = await InspectionRequest.find({ _id: { $in: requestIds } }).lean();
  const reqMap = Object.fromEntries(reqs.map(r => [String(r._id), r]));
  return ests.map(est => {
    const req = reqMap[String(est.inspectionRequestId)] || {};
    return {
      ...req,
      estimation: est,
      paymentReceiptUrl: est.paymentReceiptUrl,
      status: 'uploaded'
    };
  });
}

// 1. Get requests by status (from inspection_request)
export async function getRequestsByStatus(status) {
  const normalized = String(status || '').toLowerCase();
  return InspectionRequest.find({ status: normalized });
}

// Get requests by multiple statuses

// Fetch from inspection_request, then for each inspectionRequestId fetch estimation from inspection_estimation

export async function getRequestsAndEstimationsByStatuses(statuses) {
  // Expect statuses mapped from finance terms to request statuses
  const normalized = (statuses || []).map(s => String(s).toLowerCase());
  const requests = await InspectionRequest.find({ status: { $in: normalized } }).lean();
  const requestIds = requests.map(r => String(r._id)).filter(Boolean);
  // Get all estimations for these inspectionRequestIds
  const estimations = await InspectionEstimation.find({ inspectionRequestId: { $in: requestIds } }).lean();
  // Map estimations by inspectionRequestId for quick lookup
  const estimationMap = {};
  for (const est of estimations) {
    const key = est?.inspectionRequestId ? String(est.inspectionRequestId) : null;
    if (key) estimationMap[key] = est;
  }
  // Merge estimation data into each request (null if not found)
  return requests.map(req => {
    const key = req?._id ? String(req._id) : null;
    return {
      ...req,
      estimation: key ? (estimationMap[key] || null) : null,
    };
  });
}

// Get records by payment status from estimations (verified/rejected) and attach request fields
export async function getByPaymentStatuses(paymentStatuses) {
  const normalized = (paymentStatuses && paymentStatuses.length)
    ? paymentStatuses.map(s => String(s).toLowerCase())
    : ['verified', 'rejected'];
  const ests = await InspectionEstimation.find({ paymentStatus: { $in: normalized } }).lean();
  const requestIds = ests.map(e => String(e.inspectionRequestId)).filter(Boolean);
  const reqs = await InspectionRequest.find({ _id: { $in: requestIds } }).lean();
  const reqMap = Object.fromEntries(reqs.map(r => [String(r._id), r]));
  return ests.map(est => {
    const req = reqMap[String(est.inspectionRequestId)] || {};
    const status = est.paymentStatus === 'verified' ? 'PaymentVerified' : 'PaymentRejected';
    return {
      ...req,
      estimation: est,
      status,
      paymentReceiptUrl: est.paymentReceiptUrl
    };
  });
}

// 2. Get request details by inspectionRequestId (from both tables)
// Get all inspection estimations and populate related inspection request data
export async function getRequestDetails() {
  // Get all estimations from inspection_estimation
  const estimations = await InspectionEstimation.find().lean();
  // For each estimation, fetch related inspection_request by inspectionRequestId (not _id)
  const requestIds = estimations.map(e => String(e.inspectionRequestId)).filter(Boolean);
  const requests = await InspectionRequest.find({ _id: { $in: requestIds } })
    .select('client_ID client_name email phone_number propertyLocation_address propertyLocation_city propertyType status createdAt')
    .lean();
  // Map requests by inspectionRequestId for quick lookup
  const requestMap = {};
  for (const req of requests) {
    const key = req?._id ? String(req._id) : null;
    if (key) requestMap[key] = req;
  }
  // Merge request data into each estimation (null if not found)
  const merged = estimations.map(est => {
    const key = est?.inspectionRequestId ? String(est.inspectionRequestId) : null;
    return {
      ...est,
      inspectionRequest: key ? (requestMap[key] || null) : null,
    };
  });
  // Filter out orphan estimations with no matching InspectionRequest to ensure client/site details are available
  return merged.filter(item => item.inspectionRequest);
}

// 3. Generate estimate and update status to 'PaymentPending'
export async function generateEstimateAndUpdateStatus(inspectionRequestId, distance, estimatedCost) {
  const idStr = String(inspectionRequestId);
  // Only update fields that are provided
  const updateFields = {};
  const dNum = Number(distance);
  const cNum = Number(estimatedCost);
  if (Number.isFinite(dNum)) updateFields.distanceKm = dNum;
  if (Number.isFinite(cNum)) updateFields.estimatedCost = cNum;
  // Create or update estimation and ensure paymentStatus starts as 'pending' on insert
  const estimation = await InspectionEstimation.findOneAndUpdate(
    { inspectionRequestId: idStr },
    { $set: updateFields, $setOnInsert: { paymentStatus: 'pending' } },
    { new: true, upsert: true }
  );
  // Update request status to 'sent' after sending estimation to client
  await InspectionRequest.findByIdAndUpdate(idStr, { status: 'sent' });
  return { estimation };
}

// 4. Verify payment and update status in both tables
export async function verifyPaymentAndUpdateStatus(inspectionRequestId, paymentAmount) {
  const estimation = await InspectionEstimation.findOne({ inspectionRequestId });
  if (!estimation) throw new Error('Estimation not found');
  const verified = Number(paymentAmount) >= Number(estimation.estimatedCost || 0);
  const nextPaymentStatus = verified ? 'verified' : 'rejected';
  // Update payment fields on estimation only
  const updateDoc = {
    paymentAmount: Number(paymentAmount),
    paymentStatus: nextPaymentStatus,
  };
  const prevEstimation = await InspectionEstimation.findOneAndUpdate(
    { inspectionRequestId },
    updateDoc,
    { new: true }
  );
  // Optionally, advance request to next workflow status if desired; skipping by default
  // Finance summary balance adjustments
  if (typeof paymentAmount === 'number') {
    const prevStatus = prevEstimation?.paymentStatus;
    if (prevStatus !== 'verified' && nextPaymentStatus === 'verified') {
      await incrementIncome(paymentAmount);
      await adjustBalance(paymentAmount);
    }
    if (prevStatus === 'verified' && nextPaymentStatus !== 'verified') {
      await decrementIncome(paymentAmount);
      await adjustBalance(-paymentAmount);
    }
  }
  return { paymentStatus: nextPaymentStatus };
}

// Upload receipt URL and mark as 'uploaded'
export async function uploadReceipt(inspectionRequestId, paymentReceiptUrl) {
  const idStr = String(inspectionRequestId);
  const est = await InspectionEstimation.findOneAndUpdate(
    { inspectionRequestId: idStr },
    { paymentReceiptUrl, paymentStatus: 'uploaded' },
    { new: true, upsert: true }
  );
  return { paymentStatus: est.paymentStatus, paymentReceiptUrl: est.paymentReceiptUrl };
}
