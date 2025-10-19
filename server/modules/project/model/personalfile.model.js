import mongoose from "mongoose";
const { Schema } = mongoose;

const PersonalFileSchema = new Schema({
  originalName: { type: String, required: true },
  fileName: { type: String, required: true }, // Stored filename on server
  filePath: { type: String, required: true }, // Full file path
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  uploadedAt: { type: Date, default: Date.now },
  
  // Organization
  folderId: { type: Schema.Types.ObjectId, ref: 'PersonalFolder', index: true, sparse: true },
  
  // Tags and metadata
  tags: [{ type: String }],
  description: { type: String },
  
  // Project integration
  relatedProjectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true, sparse: true },
  relatedTaskId: { type: Schema.Types.ObjectId, ref: 'Task', index: true, sparse: true },
  
  // File status
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('PersonalFile', PersonalFileSchema);