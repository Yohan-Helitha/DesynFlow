
import mongoose from 'mongoose';
const { Schema } = mongoose;

const SupplierSchema = new Schema({
  companyName: { type: String },
  contactName: { type: String },
  email: { type: String },
  phone: { type: String },
  materialTypes: [{ type: String }],
  deliveryRegions: [{ type: String }],
  rating: { type: Number, default: 0 }
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', SupplierSchema);
export default Supplier;
