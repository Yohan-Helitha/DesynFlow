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
    const location = await InspectorLocation.findOne({ inspector: inspectorId, status: 'available' });
    if (!location) {
      return res.status(400).json({ message: 'Inspector not available.' });
    }
    // Create assignment
    const assignment = new Assignment({
      inspectionRequest: inspectionRequestId,
      inspector: inspectorId,
      assignedAt: new Date(),
      status: 'assigned'
    });
    await assignment.save();
    // Update inspector status to busy
    location.status = 'busy';
    await location.save();
    res.status(201).json({ message: 'Inspector assigned.', assignment });
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
    if (inspectorId) filter.inspector = inspectorId;
    const assignments = await Assignment.find(filter)
      .populate('inspectionRequest')
      .populate('inspector', 'name email phone');
    res.status(200).json(assignments);
  } catch (err) {
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
      const location = await InspectorLocation.findOne({ inspector: assignment.inspector });
      if (location) {
        location.status = 'available';
        await location.save();
      }
    }
    res.status(200).json({ message: 'Assignment status updated.', assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};