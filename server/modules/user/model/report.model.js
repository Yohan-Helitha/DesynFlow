import mongoose from "mongoose";
const { Schema } = mongoose;

const InspectionReportSchema = new Schema({
  inspectionRequestId: { type: Schema.Types.ObjectId, ref: 'InspectionRequest', required: true, unique: true },
  inspectorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  summary: { type: String },
  attachments: [{ type: String }], // PDF file paths or URLs
  status: { type: String, enum: ['Submitted', 'Reviewed', 'Accepted', 'RevisionsRequested'], index: true, default: 'Submitted' }
}, { timestamps: true });

export default mongoose.model('InspectionReport', InspectionReportSchema);
