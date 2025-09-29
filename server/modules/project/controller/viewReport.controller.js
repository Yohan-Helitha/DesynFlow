
import AuthInspectionReport from '../../auth/model/report.model.js';

// View submitted inspection report by project or inspection request
export const viewInspectionReport = async (req, res) => {
	try {
		const { inspectionRequestId } = req.params;
		if (!inspectionRequestId) {
			return res.status(400).json({ message: 'inspectionRequestId is required.' });
		}
		const report = await InspectionReport.findOne({ inspectionRequestId, status: 'Submitted' });
		if (!report) {
			return res.status(404).json({ message: 'Inspection report not found.' });
		}
		res.json(report);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};
