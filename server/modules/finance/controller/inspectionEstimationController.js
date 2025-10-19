import * as InspectionEstimationService from '../service/inspectionEstimationService.js';

//View inspection requests with pending/assigned/in-progress statuses merged with any estimation (treated as payment pending for finance)
export async function getPaymentPendingRequests(req, res) {
  try {
    const results = await InspectionEstimationService.getPaymentPendingWithEstimation();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


//View inspection requests by status (normalized lower-case)
export async function getPendingRequests(req, res) {
  try {
    const requests = await InspectionEstimationService.getRequestsByStatus('pending');
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

// 5. View inspection requests by status list (maps frontend filters to request statuses)
export async function getByPaymentStatus(req, res) {
  try {
    // Accept paymentStatus as comma-separated list of ['verified','rejected']; default to both
    let { paymentStatus } = req.query;
    let statuses = undefined;
    if (paymentStatus) {
      statuses = paymentStatus.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    }
    const results = await InspectionEstimationService.getByPaymentStatuses(statuses);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Upload receipt and set estimation paymentStatus to 'uploaded'
export async function uploadReceipt(req, res) {
  try {
    const { inspectionRequestId } = req.params;
    const { paymentReceiptUrl } = req.body;
    if (!paymentReceiptUrl) return res.status(400).json({ error: 'paymentReceiptUrl is required' });
    const result = await InspectionEstimationService.uploadReceipt(inspectionRequestId, paymentReceiptUrl);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
