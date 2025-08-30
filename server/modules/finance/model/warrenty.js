import moonoose from 'mongoose';

const WarrantySchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Material', index: true },
  warrantyStart: { type: Date },
  warrantyEnd: { type: Date },
  status: { type: String, enum: ['Active', 'Expired', 'Claimed', 'Replaced'], index: true }
}, { timestamps: true });
