import mongoose from "mongoose";
const { Schema } = mongoose;

const PersonalFolderSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Folder hierarchy
  parentFolder: { type: Schema.Types.ObjectId, ref: 'PersonalFolder', index: true, sparse: true },
  
  // Project integration
  relatedProjectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true, sparse: true },
  
  // Folder settings
  isPrivate: { type: Boolean, default: true },
  color: { type: String, default: '#8B4513' }, // Default brown color
  
  // Status
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('PersonalFolder', PersonalFolderSchema);