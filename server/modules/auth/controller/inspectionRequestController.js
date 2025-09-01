
import InspectionRequest from '../model/inspectionRequest.model.js';

// Create a new inspection request
export const createInspectionRequest = async (req, res) => {
	try {
		const { propertyDetails } = req.body;
		const clientId = req.user._id; // Assumes auth middleware sets req.user

		const newRequest = new InspectionRequest({
			client: clientId,
			propertyDetails,
			status: 'pending'
		});

		await newRequest.save();
		res.status(201).json({ message: 'Inspection request submitted', request: newRequest });
	} catch (error) {
		res.status(500).json({ message: 'Failed to submit inspection request', error: error.message });
	}
};

// Upload payment receipt for an inspection request
export const uploadPaymentReceipt = async (req, res) => {
	try {
		const { requestId } = req.params;
		const paymentReceiptUrl = req.file ? req.file.path : null; // Assumes file upload middleware

		if (!paymentReceiptUrl) {
			return res.status(400).json({ message: 'No payment receipt uploaded' });
		}

		const request = await InspectionRequest.findByIdAndUpdate(
			requestId,
			{ paymentReceiptUrl, status: 'verified' },
			{ new: true }
		);

		if (!request) {
			return res.status(404).json({ message: 'Inspection request not found' });
		}

		res.status(200).json({ message: 'Payment receipt uploaded', request });
	} catch (error) {
		res.status(500).json({ message: 'Failed to upload payment receipt', error: error.message });
	}
};

// Get all inspection requests for a client
export const getClientInspectionRequests = async (req, res) => {
	try {
		const clientId = req.user._id;
		const requests = await InspectionRequest.find({ client: clientId });
		res.status(200).json({ requests });
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch inspection requests', error: error.message });
	}
};

// Update status of an inspection request
export const updateInspectionRequestStatus = async (req, res) => {
	try {
		const { requestId } = req.params;
		const { status } = req.body;

		const request = await InspectionRequest.findByIdAndUpdate(
			requestId,
			{ status },
			{ new: true }
		);

		if (!request) {
			return res.status(404).json({ message: 'Inspection request not found' });
		}

		res.status(200).json({ message: 'Status updated', request });
	} catch (error) {
		res.status(500).json({ message: 'Failed to update status', error: error.message });
	}
};
