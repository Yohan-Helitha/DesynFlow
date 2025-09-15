import { getAllThresholdAlertsService } from "../service/thresholdAlertService.js";

// Get all threshold alerts
export const getAllThresholdAlerts = async (req, res) => {
    try {
        const alerts = await getAllThresholdAlertsService();
        if (!alerts.length) {
            return res.status(404).json({ message: "No threshold alerts found" });
        }
        return res.status(200).json(alerts);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};
