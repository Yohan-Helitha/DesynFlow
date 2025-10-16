import InspectionEstimation from '../model/inspection_estimation.js';
import InspectionRequest from '../../auth/model/inspectionRequest.model.js';
import { adjustBalance, incrementIncome, decrementIncome } from './financeSummaryService.js';


// Get requests with status 'PaymentPending' and join estimation data
export async function getPaymentPendingWithEstimation() {
  // Find all requests with status 'PaymentPending'
  const requests = await InspectionRequest.find({ status: 'PaymentPending' }).lean();
  // Get all related estimations
  const requestIds = requests.map(r => String(r._id)).filter(Boolean);
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

// 1. Get requests by status (from inspection_request)
export async function getRequestsByStatus(status) {
  const normalized = String(status || '').toLowerCase();
  return InspectionRequest.find({ status: normalized });
}

// Get requests by multiple statuses

// Fetch from inspection_request, then for each inspectionRequestId fetch estimation from inspection_estimation

export async function getRequestsAndEstimationsByStatuses(statuses) {
  // Get all requests with the given statuses
  const requests = await InspectionRequest.find({ status: { $in: statuses } }).lean();
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
  return estimations.map(est => {
    const key = est?.inspectionRequestId ? String(est.inspectionRequestId) : null;
    return {
      ...est,
      inspectionRequest: key ? (requestMap[key] || null) : null,
    };
  });
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
  // Create or update estimation
  let estimation = await InspectionEstimation.findOneAndUpdate(
    { inspectionRequestId: idStr },
    updateFields,
    { new: true, upsert: true }
  );
  // Update request status
  await InspectionRequest.findByIdAndUpdate(idStr, { status: 'PaymentPending' });
  return { estimation };
}

// 4. Verify payment and update status in both tables
export async function verifyPaymentAndUpdateStatus(inspectionRequestId, paymentAmount) {
  const estimation = await InspectionEstimation.findOne({ inspectionRequestId });
  if (!estimation) throw new Error('Estimation not found');
  let status;
  if (paymentAmount >= estimation.estimatedCost) {
    status = 'PaymentVerified';
  } else {
    status = 'PaymentRejected';
  }
  // Update status in both tables
  const prevRequest = await InspectionRequest.findOneAndUpdate(
    { inspectionRequestId },
    { status }
  );
  const prevEstimation = await InspectionEstimation.findOneAndUpdate(
    { inspectionRequestId },
    { paymentAmount, status }
  );
  // If verified, add to finance summary balance
  if (typeof paymentAmount === 'number') {
    const prevStatus = prevEstimation?.status;
    if (prevStatus !== 'PaymentVerified' && status === 'PaymentVerified') {
      await incrementIncome(paymentAmount);
      await adjustBalance(paymentAmount);
    }
    if (prevStatus === 'PaymentVerified' && status !== 'PaymentVerified') {
      await decrementIncome(paymentAmount);
      await adjustBalance(-paymentAmount);
    }
  }
  return { status };
}
