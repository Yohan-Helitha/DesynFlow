import ThresholdAlert from "../model/thresholdAlertModel.js";

// Get all threshold alerts
export const getAllThresholdAlertsService = async () => {
    return await ThresholdAlert.find().sort({ alertDate: -1 }); // latest alerts first
};

export const deleteThresholdAlertService = async (id, deletedBy) => {
  const threshold_alert = await ThresholdAlert.findByIdAndDelete(id);

  if (!threshold_alert) return null;

  return threshold_alert;
};