import InspectorForm from '../model/inspectorDynamicForm.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import AuthInspectionReport from '../model/report.model.js';
import PMNotification from '../model/notification.model.js';
import User from '../model/user.model.js';
import webSocketService from '../../../services/webSocketService.js';

// Create new inspector form entry
export const createInspectorForm = async (req, res) => {
  try {
    const {
      InspectionRequest_ID,
      floors,
      recommendations
    } = req.body;

    const inspector_ID = req.user._id;

    // Validation
    if (!InspectionRequest_ID || !floors || !Array.isArray(floors) || floors.length === 0) {
      return res.status(400).json({ message: 'Missing required fields. Floors data is required.' });
    }

    // Validate floors structure
    for (const floor of floors) {
      if (!floor.floor_number || !floor.rooms || !Array.isArray(floor.rooms) || floor.rooms.length === 0) {
        return res.status(400).json({ message: 'Each floor must have a floor number and at least one room.' });
      }
      
      for (const room of floor.rooms) {
        if (!room.room_name || !room.dimensions || 
            !room.dimensions.length || !room.dimensions.width || !room.dimensions.height) {
          return res.status(400).json({ message: 'Each room must have a name and complete dimensions.' });
        }
        
        // Validate room name (no numbers allowed)
        if (/\d/.test(room.room_name)) {
          return res.status(400).json({ message: 'Room names cannot contain numbers.' });
        }
        
        // Validate dimensions (only numbers allowed)
        if (isNaN(room.dimensions.length) || isNaN(room.dimensions.width) || isNaN(room.dimensions.height)) {
          return res.status(400).json({ message: 'Dimensions must be valid numbers.' });
        }
      }
    }

    const inspectionRequest = await InspectionRequest.findById(InspectionRequest_ID);
    if (!inspectionRequest) return res.status(404).json({ message: 'Inspection request not found' });

    const inspectorForm = new InspectorForm({
      InspectionRequest_ID,
      inspector_ID,
      floors,
      recommendations,
      inspection_Date: new Date(),
      status: 'completed'
    });

    await inspectorForm.save();

    res.status(201).json({ 
      message: 'Inspection form created successfully', 
      form: inspectorForm 
    });
  } catch (error) {
    console.error('Error creating inspector form:', error);
    res.status(500).json({ message: 'Failed to create form', error: error.message });
  }
};

// Update inspector form entry
export const updateInspectorForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const inspector_ID = req.user._id;

    const form = await InspectorForm.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.inspector_ID.toString() !== inspector_ID.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (form.report_generated) return res.status(400).json({ message: 'Cannot update after report generated' });

    // Handle uploaded files
    const room_photo = req.files ? req.files.map(file => file.path) : form.room_photo;

    const updateData = { ...req.body, room_photo };

    const updatedForm = await InspectorForm.findByIdAndUpdate(formId, updateData, { new: true });
    res.status(200).json({ message: 'Form updated successfully', form: updatedForm });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update form', error: error.message });
  }
};

// Submit inspector form
export const submitInspectorForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const inspector_ID = req.user._id;

    const form = await InspectorForm.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.inspector_ID.toString() !== inspector_ID.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (form.report_generated) return res.status(400).json({ message: 'Cannot submit after report generated' });

    form.completion_status = 'submitted';
    form.status = 'completed';
    await form.save();

    res.status(200).json({ message: 'Form submitted successfully', form });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit form', error: error.message });
  }
};

// Generate report from form
export const generateReportFromForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await InspectorForm.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.report_generated) return res.status(400).json({ message: 'Report already generated' });

    const report = new AuthInspectionReport({
      InspectionRequest_ID: form.InspectionRequest_ID,
      inspector_ID: form.inspector_ID,
      propertyType: form.propertyType || 'N/A',
      propertyLocation: form.propertyLocation || 'N/A',
      inspection_Date: new Date(),
      rooms: 1,
      report_content: form.inspector_notes || 'Inspection report',
      validation_status: 'pending'
    });
    await report.save();

    form.report_generated = true;
    await form.save();

    // 🔥 NEW: Create notifications for project managers
    try {
      const projectManagers = await User.find({ role: 'project manager' });
      
      for (let pm of projectManagers) {
        await PMNotification.create({
          recipient_ID: pm._id,
          sender_ID: req.user._id,
          message: `New inspection report submitted by ${req.user.username}`,
          report_ID: report._id,
          status: 'unread'
        });
      }
      
      console.log(`Notifications created for ${projectManagers.length} project managers`);
      
      // 🔥 NEW: Send real-time WebSocket notification
      const realtimeData = {
        message: `New inspection report submitted by ${req.user.username}`,
        reportId: report._id,
        inspectorName: req.user.username,
        timestamp: new Date().toISOString()
      };
      webSocketService.notifyProjectManagers(realtimeData);
      
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
      // Don't fail the entire operation if notification creation fails
    }

    // 🔥 REMOVED: Email notification service (replaced by real-time system)
    // Email notifications are no longer needed with real-time WebSocket notifications

    res.status(200).json({ message: 'Report generated successfully', report, form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inspector's own forms
export const getMyInspectorForms = async (req, res) => {
  try {
    const inspector_ID = req.user._id;
    const forms = await InspectorForm.find({ inspector_ID })
      .populate('InspectionRequest_ID', 'client_name propertyLocation_address')
      .sort({ createdAt: -1 });
    res.status(200).json({ message: 'Forms retrieved successfully', forms });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve forms', error: error.message });
  }
};

// Get all forms
export const getInspectorForms = async (req, res) => {
  try {
    const forms = await InspectorForm.find().populate('inspector_ID', 'username email').sort({ createdAt: -1 });
    res.status(200).json({ message: 'Forms retrieved successfully', forms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get form by ID
export const getInspectorFormById = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await InspectorForm.findById(formId).populate('inspector_ID', 'username email');
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.status(200).json({ message: 'Form retrieved successfully', form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete form
export const deleteInspectorForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await InspectorForm.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    await form.remove();
    res.status(200).json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 NEW: Submit form and generate report in one action
export const submitAndGenerateReport = async (req, res) => {
  try {
    const { formId } = req.params;
    const inspector_ID = req.user._id;

    // 1. Find and validate form
    const form = await InspectorForm.findById(formId).populate('InspectionRequest_ID');
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.inspector_ID.toString() !== inspector_ID.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (form.report_generated) {
      return res.status(400).json({ message: 'Report already generated' });
    }

    // 2. Submit form
    form.status = 'completed';
    await form.save();

    // 3. Generate detailed report content from form data
    const reportContent = `
Inspection Report Summary:
- Property: ${form.InspectionRequest_ID?.propertyLocation_address || 'N/A'}
- Inspector: ${req.user.username}
- Total Floors: ${form.floors?.length || 0}
- Total Rooms: ${form.floors?.reduce((total, floor) => total + (floor.rooms?.length || 0), 0) || 0}

Floor Details:
${form.floors?.map(floor => `
Floor ${floor.floor_number}:
${floor.rooms?.map(room => `  - ${room.room_name}: ${room.dimensions?.length || 0} x ${room.dimensions?.width || 0} x ${room.dimensions?.height || 0} ${room.dimensions?.unit || 'feet'}`).join('\n') || '  No rooms data'}
`).join('\n') || 'No floor data available'}

Recommendations: ${form.recommendations || 'No recommendations provided'}
    `.trim();

    // 4. Create report
    const report = new AuthInspectionReport({
      InspectionRequest_ID: form.InspectionRequest_ID._id,
      inspector_ID: form.inspector_ID,
      propertyType: form.InspectionRequest_ID?.propertyType || 'N/A',
      propertyLocation: form.InspectionRequest_ID?.propertyLocation_address || 'N/A',
      inspection_Date: new Date(),
      rooms: form.floors?.reduce((total, floor) => total + (floor.rooms?.length || 0), 0) || 1,
      report_content: reportContent,
      validation_status: 'pending'
    });
    await report.save();

    // 5. Mark form as report generated
    form.report_generated = true;
    await form.save();

    // 6. Create notifications for project managers
    try {
      const projectManagers = await User.find({ role: 'project manager' });
      
      for (let pm of projectManagers) {
        await PMNotification.create({
          recipient_ID: pm._id,
          sender_ID: req.user._id,
          message: `New inspection report submitted by ${req.user.username} for ${form.InspectionRequest_ID?.client_name || 'Client'}`,
          report_ID: report._id,
          status: 'unread'
        });
      }
      
      console.log(`Notifications created for ${projectManagers.length} project managers`);
      
      // 🔥 NEW: Send real-time WebSocket notification
      const realtimeData = {
        message: `New inspection report submitted by ${req.user.username} for ${form.InspectionRequest_ID?.client_name || 'Client'}`,
        reportId: report._id,
        inspectorName: req.user.username,
        clientName: form.InspectionRequest_ID?.client_name || 'Client',
        propertyAddress: form.InspectionRequest_ID?.propertyLocation_address || 'N/A',
        timestamp: new Date().toISOString()
      };
      webSocketService.notifyProjectManagers(realtimeData);
      
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
    }

    // 🔥 REMOVED: Email notification service (replaced by real-time system)
    // Email notifications are no longer needed with real-time WebSocket notifications

    res.status(200).json({ 
      message: 'Form submitted and report generated successfully', 
      form, 
      report 
    });
  } catch (error) {
    console.error('Error in submitAndGenerateReport:', error);
    res.status(500).json({ message: 'Failed to submit form and generate report', error: error.message });
  }
};
