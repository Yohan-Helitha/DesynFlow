import mongoose from "mongoose";
const { Schema } = mongoose;

const ReportSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reportType: { type: String, required: true },
  dateStart: { type: String }, // Using string for simple date handling
  dateEnd: { type: String },
  dateRange: {
    start: { type: Date },
    end: { type: Date }
  },
  summary: { type: String },
  includeProgress: { type: Boolean, default: false },
  includeIssues: { type: Boolean, default: false },
  includeResourceUsage: { type: Boolean, default: false },
  attachments: [{ type: String }], // file URLs/paths for supporting files
  filePath: { type: String }, // Path to generated PDF
  fileName: { type: String }, // Generated PDF filename
  status: { type: String, enum: ['draft', 'completed'], default: 'draft' }
}, { timestamps: true });

export default mongoose.model('Report', ReportSchema);
