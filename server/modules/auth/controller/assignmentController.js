import Assignment from '../model/assignment.model.js';
import InspectorLocation from '../model/inspectorLocation.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import User from '../model/user.model.js';

// Assign the nearest available inspector to an inspection request
export const assignInspector = async (req, res) => {
  try {
    const { inspectionRequestId, inspectorId } = req.body;
    if (!inspectionRequestId || !inspectorId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    
    // Check if inspector is available
    const location = await InspectorLocation.findOne({ inspector_ID: inspectorId, status: 'available' });
    if (!location) {
      return res.status(400).json({ message: 'Inspector not available.' });
    }
    
    // Get property details from inspection request
    const inspectionRequest = await InspectionRequest.findById(inspectionRequestId);
    if (!inspectionRequest) {
      return res.status(404).json({ message: 'Inspection request not found.' });
    }
    
    // Create assignment
    const assignment = new Assignment({
      InspectionRequest_ID: inspectionRequestId,
      inspector_ID: inspectorId,
      assignAt: new Date(),
      status: 'assigned'
    });
    await assignment.save();
    
    // Update inspector status to busy AND update location to property location
    location.status = 'busy';
    
    // Simple logic: Move inspector location to assigned property location
    if (inspectionRequest.property_latitude && inspectionRequest.property_longitude) {
      location.inspector_latitude = inspectionRequest.property_latitude;
      location.inspector_longitude = inspectionRequest.property_longitude;
    }
    
    // Update address to property address
    if (inspectionRequest.property_full_address) {
      location.current_address = inspectionRequest.property_full_address;
    } else {
      location.current_address = `${inspectionRequest.propertyLocation_address}, ${inspectionRequest.propertyLocation_city}`;
    }
    
    // Update region based on property city (simple region mapping)
    if (inspectionRequest.propertyLocation_city) {
      const cityToRegion = {
        'Colombo': 'Colombo',
        'Kandy': 'Kandy', 
        'Galle': 'Galle',
        'Negombo': 'Negombo',
        'Matara': 'Matara',
        'Jaffna': 'Jaffna',
        'Anuradhapura': 'Anuradhapura'
      };
      
      const newRegion = cityToRegion[inspectionRequest.propertyLocation_city] || 'Colombo';
      location.region = newRegion;
    }
    
    location.updateAt = new Date();
    await location.save();
    
    res.status(201).json({ message: 'Inspector assigned and location updated to property.', assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all assignments (optionally filter by status or inspector)
export const listAssignments = async (req, res) => {
  try {
    const { status, inspectorId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (inspectorId) filter.inspector_ID = inspectorId;
    const assignments = await Assignment.find(filter)
      .populate('InspectionRequest_ID')
      .populate('inspector_ID', 'username email phone');
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get assignments for a specific inspector
export const getInspectorAssignments = async (req, res) => {
  try {
    const { inspectorId } = req.params;
    
    const assignments = await Assignment.find({ 
      inspector_ID: inspectorId,
      status: { $in: ['assigned', 'in-progress'] }
    })
    .populate('InspectionRequest_ID')
    .sort({ assignAt: -1 });
    
    // Transform the data to match frontend expectations
    const transformedAssignments = assignments.map(assignment => {
      const inspectionRequest = assignment.InspectionRequest_ID;
      return {
        ...assignment.toObject(),
        inspectionRequest: inspectionRequest ? {
          clientName: inspectionRequest.client_name,
          clientPhone: inspectionRequest.phone_number,
          propertyAddress: inspectionRequest.propertyLocation_address,
          siteLocation: inspectionRequest.propertyLocation_address,
          preferredDate: inspectionRequest.inspection_date,
          scheduledDate: inspectionRequest.inspection_date,
          propertyType: inspectionRequest.propertyType,
          numberOfFloors: inspectionRequest.number_of_floor,
          numberOfRooms: inspectionRequest.number_of_room,
          roomNames: inspectionRequest.room_name
        } : null
      };
    });
    
    res.status(200).json(transformedAssignments);
  } catch (err) {
    console.error('Error fetching inspector assignments:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update assignment status (e.g., completed, canceled)
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status } = req.body;
    if (!['assigned', 'completed', 'canceled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });
    assignment.status = status;
    assignment.updatedAt = new Date();
    await assignment.save();
    // If completed or canceled, set inspector status to available
    if (['completed', 'canceled'].includes(status)) {
      const location = await InspectorLocation.findOne({ inspector_ID: assignment.inspector_ID });
      if (location) {
        location.status = 'available';
        location.updateAt = new Date(); // Update timestamp when becoming available
        await location.save();
        // Note: Inspector location stays at completed property (their last work location)
      }
    }
    res.status(200).json({ message: 'Assignment status updated.', assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });
    
    // Set inspector status back to available
    const location = await InspectorLocation.findOne({ inspector_ID: assignment.inspector_ID });
    if (location) {
      location.status = 'available';
      await location.save();
    }
    
    await Assignment.findByIdAndDelete(assignmentId);
    res.status(200).json({ message: 'Assignment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};