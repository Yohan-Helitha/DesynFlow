
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const { Schema } = mongoose;

const MaterialPricingSchema = new Schema({
  name: { type: String, required: true },
  pricePerUnit: { type: Number, required: true }
}, { _id: false });

const SupplierSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Link to User account
  companyName: { type: String },
  contactName: { type: String },
  email: { type: String },
  phone: { type: String },
  password: { type: String }, // Added for authentication
  materialTypes: [{ type: String }], // Keep for backward compatibility
  materials: [MaterialPricingSchema], // New field for materials with pricing
  deliveryRegions: [{ type: String }],
  rating: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true } // Added for account status
}, { timestamps: true });

// Password hashing middleware - same as User model
SupplierSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  } else {
    this.password = await bcrypt.hash(this.password, 8);
    next();
  }
});

// Password comparison method - same as User model
SupplierSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Supplier = mongoose.model('Supplier', SupplierSchema);
export default Supplier;
