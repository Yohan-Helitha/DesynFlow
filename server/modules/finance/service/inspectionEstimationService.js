import InspectionEstimation from '../model/inspection_estimation.js';

export async function getRequestsByStatus(status) {
  // Find requests by status
  return InspectionEstimation.find({ status });
}

export async function getRequestDetails(inspectionRequestId) {
  // Find estimation by ID
  const estimation = await InspectionEstimation.findOne({ inspectionRequestId });
  return { estimation };
}

export async function generateEstimate(inspectionRequestId, distance) {
  // Example cost calculation
  const estimatedCost = 1000 + (distance * 10);
  // Create estimation
  const estimation = await InspectionEstimation.create({ 
    inspectionRequestId, 
    distanceKm: distance, 
    estimatedCost 
  });
  return { estimation };
}

export async function verifyPayment(inspectionRequestId, paymentAmount) {
  const estimation = await InspectionEstimation.findOne({ inspectionRequestId });
  if (!estimation) throw new Error('Estimation not found');
  
  let status;
  if (paymentAmount >= estimation.estimatedCost) {
    status = 'PaymentVerified';
  } else {
    status = 'PaymentRejected';
  }
  
  await InspectionEstimation.updateOne(
    { inspectionRequestId }, 
    { paymentAmount, status }
  );
  return { status };
}
