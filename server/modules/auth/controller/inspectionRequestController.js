
import InspectionRequest from '../model/inspectionRequest.model.js';
import Assignment from '../model/assignment.model.js';
import AuthInspectionReport from '../model/report.model.js';
import crypto from 'crypto';

// Create simplified client inspection request (matches new model)
export const createInspectionRequest = async (req, res) => {
	try {
		const {
			client_name,
			email,
			phone_number,
			propertyLocation_address,
			propertyLocation_city,
			propertyType,
			number_of_floor = 1,
			number_of_room,
			room_name = [],
			inspection_date
		} = req.body;
		
		const client_ID = req.user._id;

		// Validate required fields (simplified for client)
		if (!client_name || !email || !phone_number || !propertyLocation_address || !propertyLocation_city || !propertyType || !number_of_room) {
			return res.status(400).json({ 
				message: 'Missing required fields: client_name, email, phone_number, propertyLocation_address, propertyLocation_city, propertyType, number_of_room' 
			});
		}

		// Generate verification token (preserve security feature)
		const verifiedToken = crypto.randomBytes(32).toString('hex');
		const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		const newRequest = new InspectionRequest({
			client_ID,
			client_name,
			email,
			phone_number,
			propertyLocation_address,
			propertyLocation_city,
			propertyType,
			number_of_floor,
			number_of_room,
			room_name: Array.isArray(room_name) ? room_name : [],
			inspection_date: inspection_date ? new Date(inspection_date) : null,
			status: 'pending',
			payment_status: 'pending',
			verifiedToken, // Keep security feature
			tokenExpiry
		});

		await newRequest.save();
		
		res.status(201).json({ 
			message: 'Inspection request created successfully', 
			request: newRequest,
			verifiedToken // Return token for client verification
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to create inspection request', error: error.message });
	}
};

// Upload payment receipt (now handled via one-time email links)
export const uploadPaymentReceipt = async (req, res) => {
	try {
		const { requestId } = req.params;
		const { paymentReceiptUrl } = req.body; // Can also come from file upload
		const clientId = req.user._id;

		const request = await InspectionRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({ message: 'Inspection request not found' });
		}

		// Verify client owns this request
		if (request.client_ID.toString() !== clientId.toString()) {
			return res.status(403).json({ message: 'Access denied: You can only upload receipt for your own request' });
		}

		const updatedRequest = await InspectionRequest.findByIdAndUpdate(
			requestId,
			{ 
				paymentReceiptUrl: paymentReceiptUrl || (req.file ? req.file.path : null),
				status: 'payment-submitted'
			},
			{ new: true }
		);

		res.status(200).json({ 
			message: 'Payment receipt uploaded successfully', 
			request: updatedRequest 
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to upload payment receipt', error: error.message });
	}
};

// Get all inspection requests for a client (simplified)
export const getClientInspectionRequests = async (req, res) => {
	try {
		const clientId = req.user._id;
		const requests = await InspectionRequest.find({ client_ID: clientId })
			.sort({ createdAt: -1 });
		res.status(200).json({ 
			message: 'Client inspection requests retrieved successfully',
			requests 
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch inspection requests', error: error.message });
	}
};

// Get all inspection requests for CSR
export const getAllInspectionRequests = async (req, res) => {
	try {
		const requests = await InspectionRequest.find({})
			.sort({ createdAt: -1 });
		res.status(200).json(requests);
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch inspection requests', error: error.message });
	}
};

// Update status of an inspection request (admin/CSR only)
export const updateInspectionRequestStatus = async (req, res) => {
	try {
		const { requestId } = req.params;
		const { status, reason } = req.body;
		const userId = req.user._id;

		const request = await InspectionRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({ message: 'Inspection request not found' });
		}

		// Validate status transitions
		const validStatuses = ['pending', 'payment-required', 'payment-submitted', 'verified', 'assigned', 'in-progress', 'completed', 'cancelled'];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ message: 'Invalid status value' });
		}

		const updatedRequest = await InspectionRequest.findByIdAndUpdate(
			requestId,
			{ 
				status,
				updated_at: new Date(),
				// Add status change reason if provided
				...(reason && { status_reason: reason })
			},
			{ new: true }
		);

		res.status(200).json({ 
			message: 'Status updated successfully', 
			request: updatedRequest,
			changedBy: userId
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to update status', error: error.message });
	}
};

// Get client progress tracking data for dashboard
export const getClientProgressTracking = async (req, res) => {
	try {
		const clientId = req.user._id;
		
		// Get all client's inspection requests with related data
		const inspectionRequests = await InspectionRequest.find({ client_ID: clientId })
			.sort({ createdAt: -1 })
			.limit(5); // Get latest 5 requests for progress tracking
		
		if (inspectionRequests.length === 0) {
			return res.status(200).json({
				message: 'No inspection requests found',
				progressData: {
					inspectionRequest: { status: 'no_requests', message: 'No inspection requests yet' },
					inspectionProgress: { status: 'no_requests', message: 'No inspection progress yet' },
					reportProgress: { status: 'no_requests', message: 'No reports yet' }
				}
			});
		}

		// Get the most recent inspection request for progress tracking
		const latestRequest = inspectionRequests[0];
		
		// Check assignment status for the latest request
		const assignment = await Assignment.findOne({ 
			InspectionRequest_ID: latestRequest._id 
		}).sort({ createdAt: -1 });
		
		// Check report status for the latest request
		const report = await AuthInspectionReport.findOne({ 
			InspectionRequest_ID: latestRequest._id 
		}).sort({ submittedAt: -1 });

		// Determine progress status for each section
		const progressData = {
			inspectionRequest: {
				status: latestRequest.status || 'submitted',
				message: getInspectionRequestMessage(latestRequest.status),
				date: latestRequest.createdAt,
				details: `${latestRequest.propertyType} property at ${latestRequest.propertyLocation_address}`
			},
			inspectionProgress: {
				status: getInspectionProgressStatus(assignment),
				message: getInspectionProgressMessage(assignment),
				date: assignment?.assignAt || assignment?.updatedAt,
				inspector: assignment ? 'Inspector assigned' : 'Awaiting assignment'
			},
			reportProgress: {
				status: getReportProgressStatus(report, assignment),
				message: getReportProgressMessage(report, assignment),
				date: report?.submittedAt,
				details: report ? 'Inspection report completed' : 'Report pending'
			}
		};

		res.status(200).json({
			message: 'Progress data retrieved successfully',
			progressData,
			totalRequests: inspectionRequests.length,
			latestRequestId: latestRequest._id
		});

	} catch (error) {
		console.error('Error fetching client progress:', error);
		res.status(500).json({ 
			message: 'Failed to fetch progress data', 
			error: error.message 
		});
	}
};

// Helper functions for progress status determination
function getInspectionRequestMessage(status) {
	switch (status) {
		case 'pending': return 'Request submitted successfully';
		case 'assigned': return 'Inspector has been assigned';
		case 'in-progress': return 'Inspection is in progress';
		case 'completed': return 'Inspection request completed';
		case 'cancelled': return 'Request was cancelled';
		default: return 'Request submitted';
	}
}

function getInspectionProgressStatus(assignment) {
	if (!assignment) return 'pending';
	switch (assignment.status) {
		case 'assigned': return 'assigned';
		case 'in-progress': return 'in-progress';
		case 'completed': return 'completed';
		case 'cancelled': return 'cancelled';
		default: return 'pending';
	}
}

function getInspectionProgressMessage(assignment) {
	if (!assignment) return 'Waiting for inspector assignment';
	switch (assignment.status) {
		case 'assigned': return 'Inspector assigned to your property';
		case 'in-progress': return 'Inspector is conducting the inspection';
		case 'completed': return 'Inspection completed successfully';
		case 'cancelled': return 'Inspection was cancelled';
		default: return 'Processing assignment';
	}
}

function getReportProgressStatus(report, assignment) {
	if (report) return 'completed';
	if (assignment?.status === 'completed') return 'completed';
	if (assignment?.status === 'in-progress') return 'in-progress';
	return 'pending';
}

function getReportProgressMessage(report, assignment) {
	if (report) return 'Inspection report is ready';
	if (assignment?.status === 'completed') return 'Report being generated';
	if (assignment?.status === 'in-progress') return 'Inspection in progress';
	return 'Waiting for inspection completion';
}
