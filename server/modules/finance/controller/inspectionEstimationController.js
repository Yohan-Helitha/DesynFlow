import * as InspectionEstimationService from '../service/inspectionEstimationService.js';

//View inspection requests with status 'PaymentPending'
export async function getPaymentPendingRequests(req, res) {
  try {
    const results = await InspectionEstimationService.getPaymentPendingWithEstimation();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


//View inspection requests status 'Pending'
export async function getPendingRequests(req, res) {
  try {
    const requests = await InspectionEstimationService.getRequestsByStatus('Pending');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//View inspection request details by inspectionRequestId (from both tables)
export async function getRequestDetails(req, res) {
  try {
    // Ignore req.params.inspectionRequestId, return all estimations with related request data
    const details = await InspectionEstimationService.getRequestDetails();
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Generate estimate based on distance and estimatedCost, update status to 'PaymentPending'
export async function generateEstimate(req, res) {
  try {
    const { inspectionRequestId } = req.params;
    const { distance, estimatedCost } = req.body;
    const result = await InspectionEstimationService.generateEstimateAndUpdateStatus(inspectionRequestId, distance, estimatedCost);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//Approve/reject payment, update status accordingly
export async function verifyPayment(req, res) {
  try {
    const { inspectionRequestId } = req.params;
    const { paymentAmount } = req.body;
    const result = await InspectionEstimationService.verifyPaymentAndUpdateStatus(inspectionRequestId, paymentAmount);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 5. View inspection requests status 'PaymentVerified' and 'PaymentRejected'
export async function getByPaymentStatus(req, res) {
  try {
    // Accept status as a comma-separated list or default to both
    let { status } = req.query;
    let statuses = ['PaymentVerified', 'PaymentRejected'];
    if (status) {
      statuses = status.split(',').map(s => s.trim()).filter(s => ['PaymentVerified', 'PaymentRejected'].includes(s));
      if (statuses.length === 0) {
        return res.status(400).json({ error: 'Invalid status' });
      }
    }
    // Fetch from inspection_request, then for each inspectionRequestId fetch estimation
    const results = await InspectionEstimationService.getRequestsAndEstimationsByStatuses(statuses);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
