import mongoose from 'mongoose';
const { Schema } = mongoose;

// Labor line items
const LaborItemSchema = new Schema({
  task: { type: String, required: true },          // Activity/task name
  hours: { type: Number, required: true },         // Hours or quantity
  rate: { type: Number, required: true },          // Rate per hour/unit
  total: { type: Number, required: true }          // Calculated total per task
}, { _id: false });

// Material line items
const MaterialItemSchema = new Schema({
  materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
  description: { type: String, required: true },  // Material description
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true }         // quantity * unitPrice
}, { _id: false });

// Service line items
const ServiceItemSchema = new Schema({
  service: { type: String, required: true },
  cost: { type: Number, required: true }
}, { _id: false });

// Contingency / Miscellaneous
const ContingencyItemSchema = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true }
}, { _id: false });

// Tax / VAT
const TaxSchema = new Schema({
  description: { type: String }, // e.g., VAT 15%
  percentage: { type: Number, required: true },
  amount: { type: Number, required: true }       // calculated
}, { _id: false });

// Main Quotation Schema
const QuotationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  estimateVersion: { type: Number, required: true },
  version: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Revised', 'Confirmed', 'Locked'], 
    default: 'Draft' 
  },
  locked: { type: Boolean, default: false },
  remarks: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  sentTo: { type: Schema.Types.ObjectId, ref: 'User' },
  sentAt: { type: Date },
  fileUrl: { type: String },

  // Detailed cost breakdown
  laborItems: [LaborItemSchema],
  materialItems: [MaterialItemSchema],
  serviceItems: [ServiceItemSchema],
  contingencyItems: [ContingencyItemSchema],
  taxes: [TaxSchema],

  // Summary
  subtotal: { type: Number, default: 0 },       // labor + materials + services
  totalContingency: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 }      // subtotal + contingency + tax

}, { timestamps: true });

// Ensure unique version per project and estimate
// Previously was { projectId: 1, version: 1 } which caused collisions across different estimate versions
QuotationSchema.index({ projectId: 1, estimateVersion: 1, version: 1 }, { unique: true, name: 'project_estimate_version_unique' });

export default mongoose.model('QuotationEstimation', QuotationSchema);
