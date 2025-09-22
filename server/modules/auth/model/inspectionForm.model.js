import mongoose from 'mongoose';

const inspectionFormSchema = new mongoose.Schema(
	{
		inspectionRequest: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'InspectionRequest',
			required: true,
		},
		inspector: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		formData: {
			type: Object, // You can replace this with a more specific schema if needed
			required: true,
		},
		status: {
			type: String,
			enum: ['pending', 'submitted', 'approved', 'rejected'],
			default: 'pending',
		},
		submittedAt: {
			type: Date,
		},
		approvedAt: {
			type: Date,
		},
		comments: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const InspectionForm = mongoose.model('InspectionForm', inspectionFormSchema);

export default InspectionForm;
