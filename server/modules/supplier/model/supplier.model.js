
import mongoose from 'mongoose';
const { Schema } = mongoose;

const MaterialPricingSchema = new Schema({
  name: { type: String, required: true },
  pricePerUnit: { type: Number, required: true }
}, { _id: false });

const SupplierSchema = new Schema({
  companyName: { type: String },
  contactName: { type: String },
  email: { type: String },
  phone: { type: String },
  materialTypes: [{ type: String }], // Keep for backward compatibility
  materials: [MaterialPricingSchema], // New field for materials with pricing
  deliveryRegions: [{ type: String }],
  rating: { type: Number, default: 0 }
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', SupplierSchema);
export default Supplier;
