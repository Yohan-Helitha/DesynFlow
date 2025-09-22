
import InspectionRequest from '../model/inspectionRequest.model.js';

// Create a new inspection request (enhanced for dynamic forms)
export const createInspectionRequest = async (req, res) => {
	try {
		const {
			clientName,
			email,
			phone,
			propertyLocation,
			propertyType,
			numberOfFloors,
			floors = [],
			preferredInspectionDate,
			alternativeDate1,
			alternativeDate2,
			documents = [],
			specialInstructions,
			urgency = 'normal'
		} = req.body;
		
		const clientId = req.user._id;

		// Validate required fields
		if (!clientName || !email || !phone || !propertyLocation?.address || !propertyType || !numberOfFloors || !preferredInspectionDate) {
			return res.status(400).json({ 
				message: 'Missing required fields: clientName, email, phone, propertyLocation.address, propertyType, numberOfFloors, preferredInspectionDate' 
			});
		}

		const newRequest = new InspectionRequest({
			client: clientId,
			clientName,
			email,
			phone,
			propertyLocation,
			propertyType,
			numberOfFloors,
			floors,
			preferredInspectionDate: new Date(preferredInspectionDate),
			alternativeDate1: alternativeDate1 ? new Date(alternativeDate1) : null,
			alternativeDate2: alternativeDate2 ? new Date(alternativeDate2) : null,
			documents,
			specialInstructions,
			urgency,
			status: 'draft',
			formProgress: {
				basicDetails: true,
				floorDetails: floors.length > 0,
				documents: documents.length > 0,
				payment: false
			},
			statusHistory: [{
				status: 'draft',
				changedBy: clientId,
				changedAt: new Date(),
				reason: 'Initial form submission'
			}]
		});

		await newRequest.save();
		
		res.status(201).json({ 
			message: 'Inspection request created successfully', 
			request: newRequest,
			completionPercentage: newRequest.completionPercentage,
			totalRooms: newRequest.totalRooms
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to create inspection request', error: error.message });
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

// Update inspection request (for dynamic form editing)
export const updateInspectionRequest = async (req, res) => {
	try {
		const { requestId } = req.params;
		const updates = req.body;
		const userId = req.user._id;

		const request = await InspectionRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({ message: 'Inspection request not found' });
		}

		// Check if user owns this request (clients can only edit their own)
		if (req.user.role === 'client' && request.client.toString() !== userId.toString()) {
			return res.status(403).json({ message: 'Access denied: You can only edit your own requests' });
		}

		// Update form progress based on what's being updated
		if (updates.floors) {
			updates['formProgress.floorDetails'] = updates.floors.length > 0;
		}
		if (updates.documents) {
			updates['formProgress.documents'] = updates.documents.length > 0;
		}

		// Add to status history if status is changing
		if (updates.status && updates.status !== request.status) {
			updates.$push = {
				statusHistory: {
					status: updates.status,
					changedBy: userId,
					changedAt: new Date(),
					reason: updates.statusReason || 'Status updated'
				}
			};
		}

		const updatedRequest = await InspectionRequest.findByIdAndUpdate(
			requestId,
			updates,
			{ new: true, runValidators: true }
		);

		res.status(200).json({ 
			message: 'Inspection request updated successfully', 
			request: updatedRequest,
			completionPercentage: updatedRequest.completionPercentage,
			totalRooms: updatedRequest.totalRooms
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to update inspection request', error: error.message });
	}
};

// Add floor to inspection request
export const addFloorToRequest = async (req, res) => {
	try {
		const { requestId } = req.params;
		const { floorNumber, floorName, rooms = [] } = req.body;

		const request = await InspectionRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({ message: 'Inspection request not found' });
		}

		// Check if floor already exists
		const existingFloor = request.floors.find(floor => floor.floorNumber === floorNumber);
		if (existingFloor) {
			return res.status(400).json({ message: 'Floor number already exists' });
		}

		const newFloor = {
			floorNumber,
			floorName: floorName || `Floor ${floorNumber}`,
			rooms,
			totalRooms: rooms.length
		};

		request.floors.push(newFloor);
		request.formProgress.floorDetails = request.floors.length > 0;
		await request.save();

		res.status(200).json({ 
			message: 'Floor added successfully', 
			request,
			totalRooms: request.totalRooms
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to add floor', error: error.message });
	}
};

// Add room to specific floor
export const addRoomToFloor = async (req, res) => {
	try {
		const { requestId, floorNumber } = req.params;
		const roomData = req.body;

		const request = await InspectionRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({ message: 'Inspection request not found' });
		}

		const floor = request.floors.find(f => f.floorNumber === parseInt(floorNumber));
		if (!floor) {
			return res.status(404).json({ message: 'Floor not found' });
		}

		// Generate unique room ID
		const roomId = `${requestId}_floor${floorNumber}_room${Date.now()}`;
		
		const newRoom = {
			roomId,
			roomName: roomData.roomName || `Room ${floor.rooms.length + 1}`,
			roomNumber: roomData.roomNumber,
			roomSize: roomData.roomSize,
			dimensions: roomData.dimensions,
			photos: roomData.photos || [],
			designPreferences: roomData.designPreferences || {},
			reusedFromRoom: roomData.reusedFromRoom
		};

		floor.rooms.push(newRoom);
		floor.totalRooms = floor.rooms.length;
		await request.save();

		res.status(200).json({ 
			message: 'Room added successfully', 
			room: newRoom,
			totalRooms: request.totalRooms
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to add room', error: error.message });
	}
};

// Copy room preferences to another room
export const copyRoomPreferences = async (req, res) => {
	try {
		const { requestId } = req.params;
		const { sourceRoomId, targetRoomId } = req.body;

		const request = await InspectionRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({ message: 'Inspection request not found' });
		}

		let sourceRoom = null;
		let targetRoom = null;

		// Find source and target rooms
		for (const floor of request.floors) {
			for (const room of floor.rooms) {
				if (room.roomId === sourceRoomId) sourceRoom = room;
				if (room.roomId === targetRoomId) targetRoom = room;
			}
		}

		if (!sourceRoom || !targetRoom) {
			return res.status(404).json({ message: 'Source or target room not found' });
		}

		// Copy preferences
		targetRoom.designPreferences = { ...sourceRoom.designPreferences };
		targetRoom.reusedFromRoom = sourceRoomId;
		await request.save();

		res.status(200).json({ 
			message: 'Room preferences copied successfully', 
			targetRoom 
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to copy room preferences', error: error.message });
	}
};

// Update status of an inspection request
export const updateInspectionRequestStatus = async (req, res) => {
	try {
		const { requestId } = req.params;
		const { status, reason } = req.body;
		const userId = req.user._id;

		const request = await InspectionRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({ message: 'Inspection request not found' });
		}

		// Add to status history
		request.statusHistory.push({
			status,
			changedBy: userId,
			changedAt: new Date(),
			reason: reason || 'Status updated'
		});

		request.status = status;
		await request.save();

		res.status(200).json({ message: 'Status updated successfully', request });
	} catch (error) {
		res.status(500).json({ message: 'Failed to update status', error: error.message });
	}
};
