import * as InspectionEstimationService from '../service/inspectionEstimationService.js';

// View inspection requests with status 'Pending'
export async function getPendingRequests(req, res) {
  try {
    const requests = await InspectionEstimationService.getRequestsByStatus('Pending');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// View inspection request details by inspectionRequestId
export async function getRequestDetails(req, res) {
  try {
    const { inspectionRequestId } = req.params;
    const details = await InspectionEstimationService.getRequestDetails(inspectionRequestId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Generate estimate based on distance
export async function generateEstimate(req, res) {
  try {
    const { inspectionRequestId } = req.params;
    const { distance } = req.body;
    const result = await InspectionEstimationService.generateEstimate(inspectionRequestId, distance);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// View inspection requests with status 'Waiting'
export async function getWaitingRequests(req, res) {
  try {
    const requests = await InspectionEstimationService.getRequestsByStatus('Waiting');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Approve/reject payment
export async function verifyPayment(req, res) {
  try {
    const { inspectionRequestId } = req.params;
    const { paymentAmount } = req.body;
    const result = await InspectionEstimationService.verifyPayment(inspectionRequestId, paymentAmount);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
