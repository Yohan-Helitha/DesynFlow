import ThresholdAlert from "../model/thresholdAlertModel.js";

// Get all threshold alerts
export const getAllThresholdAlertsService = async () => {
    return await ThresholdAlert.find().sort({ alertDate: -1 }); // latest alerts first
};
