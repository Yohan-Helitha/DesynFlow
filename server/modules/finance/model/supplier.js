import mongoose from 'mongoose';

const { Schema } = mongoose;

const SupplierSchema = new Schema({
  name: { type: String, required: true, index: true },
  contactName: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
