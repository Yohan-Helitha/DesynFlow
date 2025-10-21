import Assignment from '../model/assignment.model.js';
import InspectorLocation from '../model/inspectorLocation.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import User from '../model/user.model.js';
import webSocketService from '../../../services/webSocketService.js';

// Calculate distance between two coordinates using Haversine formula (for 35km validation)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Assign the nearest available inspector to an inspection request
export const assignInspector = async (req, res) => {
  try {
    const { inspectionRequestId, inspectorId } = req.body;
    if (!inspectionRequestId || !inspectorId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    
    // Check if inspector is available
    console.log(`🔍 Checking availability for inspector: ${inspectorId}`);
    const location = await InspectorLocation.findById(inspectorId);
    
    if (!location) {
      console.log(`❌ Inspector location not found for ID: ${inspectorId}`);
      return res.status(400).json({ message: 'Inspector location not found.' });
    }
    
    console.log(`📍 Inspector found: ${location.current_address}, Status: ${location.status}`);
    
    if (location.status !== 'available') {
      console.log(`❌ Inspector not available. Current status: ${location.status}`);
      return res.status(400).json({ message: `Inspector not available. Current status: ${location.status}` });
    }
    
    // Get property details from inspection request
    const inspectionRequest = await InspectionRequest.findById(inspectionRequestId);
    if (!inspectionRequest) {
      return res.status(404).json({ message: 'Inspection request not found.' });
    }

    // Check if there's already an assignment for this inspection request
    const existingAssignment = await Assignment.findOne({ 
      InspectionRequest_ID: inspectionRequestId,
      status: { $in: ['assigned', 'in-progress'] }
    });
    if (existingAssignment) {
      return res.status(400).json({ message: 'This inspection request is already assigned to another inspector.' });
    }

    // Calculate distance for 35km assignment validation
    let calculatedDistance = null;
    if (inspectionRequest.property_latitude && inspectionRequest.property_longitude) {
      calculatedDistance = calculateDistance(
        location.inspector_latitude,
        location.inspector_longitude,
        inspectionRequest.property_latitude,
        inspectionRequest.property_longitude
      );
      
      // Enforce 35km maximum distance rule for assignments
      if (calculatedDistance > 35) {
        return res.status(400).json({ 
          message: `Assignment not allowed. Inspector is ${calculatedDistance.toFixed(1)}km away from property (Maximum: 35km)`,
          distance: calculatedDistance.toFixed(1),
          maxDistance: 35,
          inspectorLocation: {
            address: location.current_address,
            coordinates: `${location.inspector_latitude}, ${location.inspector_longitude}`
          },
          propertyLocation: {
            address: inspectionRequest.property_full_address || `${inspectionRequest.propertyLocation_address}, ${inspectionRequest.propertyLocation_city}`,
            coordinates: `${inspectionRequest.property_latitude}, ${inspectionRequest.property_longitude}`
          }
        });
      }
    }

    // Create assignment (only if within 35km)
    const assignment = new Assignment({
      InspectionRequest_ID: inspectionRequestId,
      inspector_ID: location.inspector_ID, // Use the actual inspector user ID, not the location ID
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
    
    // Send assignment details to inspector (real-time notification)
    const assignmentDetails = {
      assignmentId: assignment._id,
      propertyAddress: inspectionRequest.property_full_address || 
        `${inspectionRequest.propertyLocation_address}, ${inspectionRequest.propertyLocation_city}`,
      propertyType: inspectionRequest.propertyType,
      clientName: inspectionRequest.client_name,
      clientPhone: inspectionRequest.phone_number,
      inspectionStartDate: inspectionRequest.inspection_date,
      inspectionEndDate: inspectionRequest.inspection_date, // Same as start for now
      numberOfRooms: inspectionRequest.number_of_room,
      numberOfFloors: inspectionRequest.number_of_floor,
      roomNames: inspectionRequest.room_name,
      assignedAt: assignment.assignAt,
      status: 'assigned'
    };
    
    // Send notification to inspector
    const notificationSent = webSocketService.sendToUser(
      location.inspector_ID, 
      'new_assignment', 
      {
        type: 'NEW_ASSIGNMENT',
        title: '🔔 New Inspection Assignment',
        message: `You have been assigned to inspect ${inspectionRequest.client_name}'s property`,
        assignmentDetails,
        timestamp: new Date()
      }
    );
    
    console.log(`Assignment notification sent to inspector ${location.inspector_ID}:`, notificationSent);
    
    res.status(201).json({ 
      message: 'Inspector assigned and location updated to property successfully.', 
      assignment,
      assignmentDetails,
      notificationSent,
      distanceInfo: {
        calculated: calculatedDistance ? calculatedDistance.toFixed(1) : 'N/A',
        unit: 'km',
        withinLimit: calculatedDistance ? calculatedDistance <= 35 : true,
        maxAllowed: 35
      }
    });
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

// Update assignment status (e.g., completed, canceled, declined, paused)
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { 
      status, 
      decline_reason, 
      action_notes, 
      inspection_start_time, 
      inspection_end_time 
    } = req.body;
    
    // Validate status
    if (!['assigned', 'in-progress', 'paused', 'completed', 'declined', 'canceled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });
    
    // Update assignment fields
    assignment.status = status;
    assignment.updatedAt = new Date();
    
    // Add decline reason if provided
    if (decline_reason) {
      assignment.decline_reason = decline_reason;
    }
    
    // Add action notes if provided
    if (action_notes) {
      assignment.action_notes = action_notes;
    }
    
    // Handle timing updates
    if (inspection_start_time) {
      assignment.inspection_start_time = new Date(inspection_start_time);
    }
    
    if (inspection_end_time) {
      assignment.inspection_end_time = new Date(inspection_end_time);
    }
    
    await assignment.save();
    
    // Update inspector status and location based on assignment status
    const location = await InspectorLocation.findOne({ inspector_ID: assignment.inspector_ID });
    if (location) {
      switch (status) {
        case 'in-progress':
          location.status = 'busy';
          
          // Update inspector's current address to the inspection location
          const inspectionRequest = await InspectionRequest.findById(assignment.InspectionRequest_ID);
          if (inspectionRequest) {
            // Update inspector location to property coordinates and address
            if (inspectionRequest.property_latitude && inspectionRequest.property_longitude) {
              location.inspector_latitude = inspectionRequest.property_latitude;
              location.inspector_longitude = inspectionRequest.property_longitude;
            }
            
            // Set current address to property address
            if (inspectionRequest.property_full_address) {
              location.current_address = inspectionRequest.property_full_address;
            }
            
            console.log(`Inspector location updated to property: ${inspectionRequest.property_full_address}`);
          }
          break;
        case 'completed':
        case 'canceled':
        case 'declined':
          location.status = 'available';
          // Note: Keep inspector at property location even after completion for tracking
          break;
        case 'paused':
          // Keep current status (usually 'busy')
          break;
        default:
          // 'assigned' - keep current status
          break;
      }
      
      location.updateAt = new Date();
      await location.save();
    }
    
    // Send real-time notifications based on status changes
    const populatedAssignment = await Assignment.findById(assignmentId)
      .populate('InspectionRequest_ID')
      .populate('inspector_ID', 'username email phone');
    
    if (populatedAssignment) {
      const inspectionRequest = populatedAssignment.InspectionRequest_ID;
      const inspector = populatedAssignment.inspector_ID;
      
      // Send notification to CSR when inspector accepts/declines
      if (status === 'declined') {
        // Notify CSR about decline
        webSocketService.sendToRole('customer service representative', 'assignment_declined', {
          type: 'ASSIGNMENT_DECLINED',
          title: '❌ Assignment Declined',
          message: `Inspector ${inspector.username} declined the assignment for ${inspectionRequest.client_name}'s property`,
          assignmentId: assignmentId,
          inspectorName: inspector.username,
          clientName: inspectionRequest.client_name,
          propertyAddress: inspectionRequest.propertyLocation_address,
          declineReason: decline_reason,
          timestamp: new Date()
        });
      } else if (status === 'in-progress') {
        // Notify CSR when inspector accepts (starts inspection)
        webSocketService.sendToRole('customer service representative', 'assignment_accepted', {
          type: 'ASSIGNMENT_ACCEPTED',
          title: '✅ Assignment Accepted',
          message: `Inspector ${inspector.username} started inspection for ${inspectionRequest.client_name}'s property`,
          assignmentId: assignmentId,
          inspectorName: inspector.username,
          clientName: inspectionRequest.client_name,
          propertyAddress: inspectionRequest.propertyLocation_address,
          timestamp: new Date()
        });
        
        // Notify client when inspector accepts
        webSocketService.sendToUser(inspectionRequest.client_ID, 'inspector_accepted', {
          type: 'INSPECTOR_ACCEPTED',
          title: '🎉 Inspector Assigned to Your Property',
          message: `Inspector ${inspector.username} has accepted your inspection request and will begin the inspection`,
          inspectorName: inspector.username,
          inspectorPhone: inspector.phone,
          propertyAddress: inspectionRequest.propertyLocation_address,
          estimatedStartTime: inspection_start_time || new Date(),
          timestamp: new Date()
        });
      } else if (status === 'completed') {
        // Notify CSR when inspection is completed
        webSocketService.sendToRole('customer service representative', 'assignment_completed', {
          type: 'ASSIGNMENT_COMPLETED',
          title: '🏁 Inspection Completed',
          message: `Inspector ${inspector.username} completed inspection for ${inspectionRequest.client_name}'s property`,
          assignmentId: assignmentId,
          inspectorName: inspector.username,
          clientName: inspectionRequest.client_name,
          propertyAddress: inspectionRequest.propertyLocation_address,
          completedAt: inspection_end_time || new Date(),
          timestamp: new Date()
        });
      }
    }
    
    res.status(200).json({ 
      message: 'Assignment status updated successfully.', 
      assignment: populatedAssignment,
      inspector_status: location?.status 
    });
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

// Get available inspectors with distances from a specific property (for CSR selection)
export const getAvailableInspectorsWithDistances = async (req, res) => {
  try {
    const { inspectionRequestId } = req.params;
    
    // Get property details
    const inspectionRequest = await InspectionRequest.findById(inspectionRequestId);
    if (!inspectionRequest) {
      return res.status(404).json({ message: 'Inspection request not found.' });
    }
    
    // Get all available inspectors
    const availableInspectors = await InspectorLocation.find({ 
      status: 'available' 
    }).populate('inspector_ID', 'username email phone');
    
    // Calculate distances for each inspector
    const inspectorsWithDistances = availableInspectors.map(location => {
      let distance = null;
      let withinLimit = false;
      
      if (inspectionRequest.property_latitude && inspectionRequest.property_longitude && 
          location.inspector_latitude && location.inspector_longitude) {
        distance = calculateDistance(
          location.inspector_latitude,
          location.inspector_longitude,
          inspectionRequest.property_latitude,
          inspectionRequest.property_longitude
        );
        withinLimit = distance <= 35;
      }
      
      return {
        inspector: location.inspector_ID,
        location: {
          coordinates: {
            latitude: location.inspector_latitude,
            longitude: location.inspector_longitude
          },
          address: location.current_address,
          region: location.region,
          status: location.status
        },
        distance: {
          calculated: distance ? distance.toFixed(1) : 'N/A',
          unit: 'km',
          withinLimit: withinLimit,
          maxAllowed: 35
        }
      };
    });
    
    // Sort by distance (closest first)
    inspectorsWithDistances.sort((a, b) => {
      if (a.distance.calculated === 'N/A') return 1;
      if (b.distance.calculated === 'N/A') return -1;
      return parseFloat(a.distance.calculated) - parseFloat(b.distance.calculated);
    });
    
    res.status(200).json({
      property: {
        address: inspectionRequest.property_full_address || 
          `${inspectionRequest.propertyLocation_address}, ${inspectionRequest.propertyLocation_city}`,
        coordinates: {
          latitude: inspectionRequest.property_latitude,
          longitude: inspectionRequest.property_longitude
        }
      },
      availableInspectors: inspectorsWithDistances,
      totalInspectors: inspectorsWithDistances.length,
      inspectorsWithinLimit: inspectorsWithDistances.filter(i => i.distance.withinLimit).length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};