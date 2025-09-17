
import mongoose from 'mongoose';
const { Schema } = mongoose;


const ProjectEstimationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true, required: true },
  version: { type: Number, required: true },
  laborCost: { type: Number, required: true },
  materialCost: { type: Number, required: true },
  serviceCost: { type: Number, required: true },
  contingencyCost: { type: Number, required: true },
  total: { type: Number, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ProjectEstimationSchema.index({ projectId: 1, version: 1 }, { unique: true });

// Auto-calculate total before save
ProjectEstimationSchema.pre('save', function(next) {
  this.total = (this.laborCost || 0) + (this.materialCost || 0) + (this.serviceCost || 0) + (this.contingencyCost || 0);
  next();
});

export default mongoose.model('ProjectEstimation', ProjectEstimationSchema);
