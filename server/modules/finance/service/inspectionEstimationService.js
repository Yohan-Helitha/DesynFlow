
import InspectionEstimation from '../model/inspection_estimation.js';
import InspectionRequest from '../model/inspection_request.js';


// Get requests with status 'PaymentPending' and join estimation data
export async function getPaymentPendingWithEstimation() {
  // Find all requests with status 'PaymentPending'
  const requests = await InspectionRequest.find({ status: 'PaymentPending' }).lean();
  // Get all related estimations
  const requestIds = requests.map(r => r.inspectionRequestId);
  const estimations = await InspectionEstimation.find({ inspectionRequestId: { $in: requestIds } }).lean();
  // Map estimations by inspectionRequestId for quick lookup
  const estimationMap = {};
  for (const est of estimations) {
    estimationMap[est.inspectionRequestId.toString()] = est;
  }
  // Merge estimation data into each request (null if not found)
  return requests.map(req => ({
    ...req,
    estimation: estimationMap[req.inspectionRequestId.toString()] || null
  }));
}

// 1. Get requests by status (from inspection_request)
export async function getRequestsByStatus(status) {
  return InspectionRequest.find({ status });
}

// Get requests by multiple statuses

// Fetch from inspection_request, then for each inspectionRequestId fetch estimation from inspection_estimation

export async function getRequestsAndEstimationsByStatuses(statuses) {
  // Get all requests with the given statuses
  const requests = await InspectionRequest.find({ status: { $in: statuses } }).lean();
  const requestIds = requests.map(r => r.inspectionRequestId);
  // Get all estimations for these inspectionRequestIds
  const estimations = await InspectionEstimation.find({ inspectionRequestId: { $in: requestIds } }).lean();
  // Map estimations by inspectionRequestId for quick lookup
  const estimationMap = {};
  for (const est of estimations) {
    estimationMap[est.inspectionRequestId.toString()] = est;
  }
  // Merge estimation data into each request (null if not found)
  return requests.map(req => ({
    ...req,
    estimation: estimationMap[req.inspectionRequestId.toString()] || null
  }));
}

// 2. Get request details by inspectionRequestId (from both tables)
// Get all inspection estimations and populate related inspection request data
export async function getRequestDetails() {
  // Get all estimations from inspection_estimation
  const estimations = await InspectionEstimation.find().lean();
  // For each estimation, fetch related inspection_request by inspectionRequestId (not _id)
  const requestIds = estimations.map(e => e.inspectionRequestId);
  const requests = await InspectionRequest.find({ inspectionRequestId: { $in: requestIds } })
    .select('inspectionRequestId clientId clientName email phone siteLocation propertyType')
    .lean();
  // Map requests by inspectionRequestId for quick lookup
  const requestMap = {};
  for (const req of requests) {
    requestMap[req.inspectionRequestId.toString()] = req;
  }
  // Merge request data into each estimation (null if not found)
  return estimations.map(est => ({
    ...est,
    inspectionRequest: requestMap[est.inspectionRequestId?.toString()] || null
  }));
}

// 3. Generate estimate and update status to 'PaymentPending'
export async function generateEstimateAndUpdateStatus(inspectionRequestId, distance, estimatedCost) {
  // Only update fields that are provided
  const updateFields = {};
  if (distance !== undefined) updateFields.distanceKm = distance;
  if (estimatedCost !== undefined) updateFields.estimatedCost = estimatedCost;
  // Create or update estimation
  let estimation = await InspectionEstimation.findOneAndUpdate(
    { inspectionRequestId },
    updateFields,
    { new: true, upsert: true }
  );
  // Update request status
  await InspectionRequest.findOneAndUpdate(
    { inspectionRequestId },
    { status: 'PaymentPending' }
  );
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
  await InspectionRequest.findOneAndUpdate(
    { inspectionRequestId },
    { status }
  );
  await InspectionEstimation.findOneAndUpdate(
    { inspectionRequestId },
    { paymentAmount, status }
  );
  return { status };
}
