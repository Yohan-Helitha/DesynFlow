import InspectorForm from '../model/inspectorDynamicForm.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import Report from '../model/report.model.js';
import ProjectManagerNotificationService from '../../../services/projectManagerNotificationService.js';

// Create new inspector form entry
export const createInspectorForm = async (req, res) => {
  try {
    const {
      InspectionRequest_ID,
      floor_number,
      roomID,
      room_name,
      room_dimension,
      inspector_notes
    } = req.body;

    const inspector_ID = req.user._id;

    if (!InspectionRequest_ID || !floor_number || !roomID || !room_name) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const inspectionRequest = await InspectionRequest.findById(InspectionRequest_ID);
    if (!inspectionRequest) return res.status(404).json({ message: 'Inspection request not found' });

    // Handle uploaded files
    const room_photo = req.files ? req.files.map(file => file.path) : [];

    const inspectorForm = new InspectorForm({
      InspectionRequest_ID,
      inspector_ID,
      floor_number,
      roomID,
      room_name,
      room_dimension,
      room_photo,
      inspector_notes,
      inspection_Date: new Date(),
      status: 'in-progress',
      completion_status: 'draft',
      report_generated: false
    });

    await inspectorForm.save();

    res.status(201).json({ message: 'Inspector form created successfully', form: inspectorForm });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create inspector form', error: error.message });
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

    const report = new Report({
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

    // 🔥 NEW: Notify project managers about the generated report
    try {
      const notification = await ProjectManagerNotificationService.notifyReportGenerated(report._id);
      console.log('Project Manager notification result:', notification);
    } catch (notificationError) {
      console.error('Failed to notify project managers:', notificationError);
      // Don't fail the entire operation if notification fails
    }

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
