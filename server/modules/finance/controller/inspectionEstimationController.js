// View inspection requests with status 'PaymentPending'
export async function getPaymentPendingRequests(req, res) {
  try {
    const requests = await InspectionEstimationService.getRequestsByStatus('PaymentPending');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

import * as InspectionEstimationService from '../service/inspectionEstimationService.js';

// 1. View inspection requests status 'Pending'
export async function getPendingRequests(req, res) {
  try {
    const requests = await InspectionEstimationService.getRequestsByStatus('Pending');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 2. View inspection request details by inspectionRequestId (from both tables)
export async function getRequestDetails(req, res) {
  try {
    const { inspectionRequestId } = req.params;
    const details = await InspectionEstimationService.getRequestDetails(inspectionRequestId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 3. Generate estimate based on distance, update status to 'PaymentPending'
export async function generateEstimate(req, res) {
  try {
    const { inspectionRequestId } = req.params;
    const { distance } = req.body;
    const result = await InspectionEstimationService.generateEstimateAndUpdateStatus(inspectionRequestId, distance);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 4. Approve/reject payment, update status accordingly
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
    const requests = await InspectionEstimationService.getRequestsByStatuses(statuses);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
