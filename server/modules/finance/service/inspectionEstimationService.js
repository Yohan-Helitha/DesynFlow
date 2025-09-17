
import InspectionEstimation from '../model/inspection_estimation.js';
import InspectionRequest from '../model/inspection_request.js';


// 1. Get requests by status (from inspection_request)
export async function getRequestsByStatus(status) {
  return InspectionRequest.find({ status });
}

// Get requests by multiple statuses
export async function getRequestsByStatuses(statuses) {
  return InspectionRequest.find({ status: { $in: statuses } });
}

// 2. Get request details by inspectionRequestId (from both tables)
export async function getRequestDetails(inspectionRequestId) {
  const request = await InspectionRequest.findOne({ inspectionRequestId });
  const estimation = await InspectionEstimation.findOne({ inspectionRequestId });
  return { request, estimation };
}

// 3. Generate estimate and update status to 'PaymentPending'
export async function generateEstimateAndUpdateStatus(inspectionRequestId, distance) {
  // Calculate cost (example: 1000 + distance * 10)
  const estimatedCost = 1000 + (distance * 10);
  // Create or update estimation
  let estimation = await InspectionEstimation.findOneAndUpdate(
    { inspectionRequestId },
    { distanceKm: distance, estimatedCost },
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
