import InspectorForm from '../model/inspectorDynamicForm.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';

// Create new inspector form entry (inspector fills this after visiting property)
export const createInspectorForm = async (req, res) => {
    try {
        const {
            InspectionRequest_ID,
            floor_number,
            roomID,
            room_name,
            room_dimension,
            room_photo = [],
            inspector_notes
        } = req.body;

        const inspector_ID = req.user._id;

        // Validate required fields
        if (!InspectionRequest_ID || !floor_number || !roomID || !room_name) {
            return res.status(400).json({
                message: 'Missing required fields: InspectionRequest_ID, floor_number, roomID, room_name'
            });
        }

        // Verify inspection request exists and inspector is assigned
        const inspectionRequest = await InspectionRequest.findById(InspectionRequest_ID);
        if (!inspectionRequest) {
            return res.status(404).json({ message: 'Inspection request not found' });
        }

        const inspectorForm = new InspectorForm({
            InspectionRequest_ID,
            inspector_ID,
            floor_number,
            roomID,
            room_name,
            room_dimension,
            room_photo: Array.isArray(room_photo) ? room_photo : [],
            inspector_notes,
            inspection_Date: new Date(),
            status: 'in-progress',
            completion_status: 'draft'
        });

        await inspectorForm.save();

        res.status(201).json({
            message: 'Inspector form created successfully',
            form: inspectorForm
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to create inspector form',
            error: error.message
        });
    }
};

// Update inspector form entry
export const updateInspectorForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const inspector_ID = req.user._id;

        const form = await InspectorForm.findById(formId);
        if (!form) {
            return res.status(404).json({ message: 'Inspector form not found' });
        }

        // Verify inspector ownership
        if (form.inspector_ID.toString() !== inspector_ID.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this form' });
        }

        const updateData = { ...req.body };

        const updatedForm = await InspectorForm.findByIdAndUpdate(
            formId,
            updateData,
            { new: true }
        );

        res.status(200).json({
            message: 'Inspector form updated successfully',
            form: updatedForm
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update inspector form',
            error: error.message
        });
    }
};

// Get inspector forms by inspection request
export const getInspectorFormsByRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const forms = await InspectorForm.find({ InspectionRequest_ID: requestId })
            .populate('inspector_ID', 'username email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Inspector forms retrieved successfully',
            forms
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve inspector forms',
            error: error.message
        });
    }
};

// Submit inspector form (complete the inspection)
export const submitInspectorForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const inspector_ID = req.user._id;

        const form = await InspectorForm.findById(formId);
        if (!form) {
            return res.status(404).json({ message: 'Inspector form not found' });
        }

        // Verify inspector ownership
        if (form.inspector_ID.toString() !== inspector_ID.toString()) {
            return res.status(403).json({ message: 'Not authorized to submit this form' });
        }

        // Update form status
        form.completion_status = 'submitted';
        form.status = 'completed';
        await form.save();

        res.status(200).json({
            message: 'Inspector form submitted successfully',
            form
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to submit inspector form',
            error: error.message
        });
    }
};

// Get inspector's own forms
export const getMyInspectorForms = async (req, res) => {
    try {
        const inspector_ID = req.user._id;

        const forms = await InspectorForm.find({ inspector_ID })
            .populate('InspectionRequest_ID', 'client_name propertyLocation_address')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Your inspector forms retrieved successfully',
            forms
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve your forms',
            error: error.message
        });
    }
};