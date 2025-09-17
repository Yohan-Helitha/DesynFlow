import mongoose from "mongoose";

const { Schema } = mongoose;

const InspectionRequestSchema = new Schema({
inspectionRequestId: { type: Schema.Types.ObjectId, required: true, unique:
true },
clientId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
clientName: { type: String },
email: { type: String },
phone: { type: String },
siteLocation: { type: String },
propertyType: { type: String, enum: ['House', 'Hotel', 'Office', 'Other'] },
floors: [],
status: { type: String, enum: ['Pending', 'PaymentPending', 'Assigned', 'On Hold', 'Completed', 'PaymentRejected', 'PaymentVerified'], index: true, default: 'Pending' },
assignedInspectorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
paymentReceiptUrl: { type: String },
inspectionReportId: { type: Schema.Types.ObjectId, ref: 'InspectionReport' }
}, { timestamps: true });

export default mongoose.model('InspectionRequest', InspectionRequestSchema);