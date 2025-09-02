const InspectionRequest = require('../../model/inspection_estimation');
const InspectionEstimation = require('../../model/inspection_estimation');

module.exports = {
  async getRequestsByStatus(status) {
    // Find requests by status
    return InspectionRequest.find({ status });
  },

  async getRequestDetails(inspectionRequestId) {
    // Find request and estimation by ID
    const request = await InspectionRequest.findOne({ inspectionRequestId });
    const estimation = await InspectionEstimation.findOne({ inspectionRequestId });
    return { request, estimation };
  },

  async generateEstimate(inspectionRequestId, distance) {
    // Example cost calculation
    const estimatedCost = 1000 + (distance * 10);
    // Create estimation
    const estimation = await InspectionEstimation.create({ inspectionRequestId, distance, estimatedCost });
    // Update request status
    await InspectionRequest.updateOne({ inspectionRequestId }, { status: 'PaymentPending' });
    return { estimation };
  },

  async verifyPayment(inspectionRequestId, paymentAmount) {
    const estimation = await InspectionEstimation.findOne({ inspectionRequestId });
    if (!estimation) throw new Error('Estimation not found');
    let status;
    if (paymentAmount >= estimation.estimatedCost) {
      status = 'PayemntVerified';
    } else {
      status = 'PaymentRejected';
    }
    await InspectionRequest.updateOne({ inspectionRequestId }, { status });
    await InspectionEstimation.updateOne({ inspectionRequestId }, { paymentAmount, status });
    return { status };
  }
};
